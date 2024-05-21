import {defineStore} from "pinia";
import {
    computed,
    type Ref,
    type ShallowReactive,
    ref,
    shallowReactive,
    watch
} from "vue";
import {AnsiUp} from 'ansi_up'
import {debouncedWatch} from "@vueuse/core";
import {type IUartConfig, uart_send_msg} from "@/api/apiUart";

interface IDataArchive {
    time: number;
    isRX: boolean;
    data: Uint8Array;
}

export interface IDataBuf {
    time: string;
    isRX: boolean;
    type: number;
    data: Uint8Array;
    str: string;
    hex: string;
    hexdump: string;
}

function decodeUtf8(u8Arr: Uint8Array) {
    try {
        const decoder = new TextDecoder();
        const decodedText = decoder.decode(u8Arr); // Attempt to decode
        return decodedText.replace(/\uFFFD/g, '');  // Remove all � characters
    } catch (error) {
        return "";
    }
}

function escapeHTML(text: string) {
    const element = document.createElement('p');
    element.textContent = text;
    return element.innerHTML;
}

function unescapeString(str: string) {
    return str.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-7]{1,3}|.)/g, (_, escapeChar) => {
        switch (escapeChar[0]) {
            case 'n':
                return '\n';
            case 'r':
                return '\r';
            case 't':
                return '\t';
            case 'b':
                return '\b';
            case 'v':
                return '\v';
            case '0':
                return '\0';
            case 'x':
                return String.fromCharCode(parseInt(escapeChar.slice(1), 16));
            case 'u':
                return String.fromCharCode(parseInt(escapeChar.slice(1), 16));
            default:
                if (/^[0-7]{1,3}$/.test(escapeChar)) {
                    return String.fromCharCode(parseInt(escapeChar, 8));
                }
                return escapeChar;
        }
    });
}

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
const ansi_up = new AnsiUp();
ansi_up.escape_html = false;

const ANSI_REFRESH_WINDOW = new Uint8Array([0x1B, 0x5B, 0x37, 0x74]);
const ANSI_CLEAR_WINDOW = new Uint8Array([0x1B, 0x5B, 0x32, 0x4A]);

/* quick HEX lookup table */
const byteToHex: string[] = new Array(256);
for (let n = 0; n <= 0xff; ++n) {
    byteToHex[n] = n.toString(16).padStart(2, "0").toUpperCase();
}

function u8toHexString(buff: Uint8Array) {
    const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()
    if (buff.length === 0) {
        return ""
    }

    for (let i = 0; i < buff.length; ++i)
        hexOctets.push(byteToHex[buff[i]]);

    return hexOctets.join(" ");
}

function u8toHexdump(buffer: Uint8Array) {
    const lines: string[] = [];
    const bytesPerRow = 16;

    for (let lineStart = 0; lineStart < buffer.length; lineStart += bytesPerRow) {
        let result = lineStart.toString(16).padStart(4, '0') + ": ";
        let ascii = "";

        // Process each byte in the row
        for (let i = 0; i < bytesPerRow; i++) {
            const byteIndex = lineStart + i;
            if (byteIndex >= buffer.length) {
                // Pad the row if it's shorter than the full width
                result += "   ";
            } else {
                const byte = buffer[byteIndex];
                result += byteToHex[byte] + " ";

                // Prepare the ASCII representation, non-printable as '.'
                if (byte >= 32 && byte <= 126) {
                    ascii += String.fromCharCode(byte);
                } else {
                    ascii += ".";
                }
            }
            if (i === 8) {
                result += " "
            }
        }

        result += "|" + ascii + "|" + " ".repeat(16 - ascii.length);
        lines.push(result);
    }

    return strToHTML(escapeHTML(lines.join('\n')));
}

function strToHTML(str: string) {
    return str.replace(/\n/g, '<br>') // Replace newline with <br> tag
        .replace(/\t/g, '&emsp;') // Replace tab with spaces (or you could use '&nbsp;' for single spaces)
        .replace(/ /g, '&nbsp;');
}

function isArrayContained(subArray: Uint8Array, mainArray: Uint8Array,
                          sub_start: number = 0, main_start: number = 0) {
    if (subArray.length === 0) return -1;
    outerLoop: for (let i = main_start; i <= mainArray.length - subArray.length; i++) {
        // Check if subArray is found starting at position i in mainArray
        for (let j = sub_start; j < subArray.length; j++) {
            if (mainArray[i + j] !== subArray[j]) {
                continue outerLoop; // Continue the outer loop if mismatch found
            }
        }
        return i; // subArray is found within mainArray
    }
    return -1;
}

const baudArr = [
    {
        start: 300,
        count: 9,
    }, {
        start: 14400,
        count: 9,
    }
]

function generateBaudArr(results: { baud: number;}[]) {
    for (let i = 0; i < baudArr.length; ++i) {
        let start = baudArr[i].start;
        for (let j = 0; j < baudArr[i].count; ++j) {
            results.push({baud: start});
            start += start;
        }
    }

    results.sort((a, b) => {
        return a.baud - b.baud;
    });
}

export const useDataViewerStore = defineStore('text-viewer', () => {
    /* private value */
    const predefineColors = [
        '#f0f9eb',
        '#ecf4ff',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        'rgba(85,155,197,0.44)',
    ]

    const predefinedUartBaudFrequent = Object.freeze([
        {
            baud: 115200,
        }, {
            baud: 921600,
        }, {
            baud: 9600,
        }
    ])

    const uartBaudList: { baud: number; }[] = [];
    generateBaudArr(uartBaudList);

    /* public value */
    const configPanelTab = ref("second");
    const configPanelShow = ref(true);
    const quickAccessPanelShow = ref(true);
    const enableAnsiDecode = ref(true);
    const frameBreakSequence = ref("\\n");
    const frameBreakSequenceNormalized = ref(new Uint8Array(0));
    const frameBreakDelay = ref(0);

    const showText = ref(true);
    const showHex = ref(false);
    const showHexdump = ref(false);
    const enableLineWrap = ref(true);
    const showTimestamp = ref(true);
    const showVirtualScroll = ref(true);

    const RxHexdumpColor = ref("#f0f9eb");
    const RxTotalByteCount = ref(0);
    const RxByteCount = ref(0);

    const TxHexdumpColor = ref("#ecf4ff");
    const TxTotalByteCount = ref(0);
    const TxByteCount = ref(0);

    const enableFilter = ref(true);
    const enableMatch = ref(false);
    const forceToBottom = ref(true);
    const filterChanged = ref(false);

    const textSuffixValue = ref("")
    const textPrefixValue = ref("")

    const uartBaud = ref(115200);
    const uartBaudReal = ref(115200);
    const uartConfig: Ref<IUartConfig> = ref({
        data_bits: 8,
        parity: 0,
        stop_bits: 1,
    });

    const filterValue = ref("");
    const computedFilterValue = computed(() => {
        const str = unescapeString(filterValue.value);
        const encoder = new TextEncoder();
        return encoder.encode(str);
    })

    const computedSuffixValue = computed(() => {
        const str = unescapeString(textSuffixValue.value);
        const encoder = new TextEncoder();
        return encoder.encode(str);
    })

    const computedPrefixValue = computed(() => {
        const str = unescapeString(textPrefixValue.value);
        const encoder = new TextEncoder();
        return encoder.encode(str);
    })

    // debouncedWatch(() => frameBreakSequence.value, (newValue) => {
    //     const unescapedStr = unescapeString(newValue);
    //     const encoder = new TextEncoder();
    //     frameBreakSequenceNormalized.value = encoder.encode(unescapedStr);
    // }, {debounce: 300, immediate: true});
    //
    // debouncedWatch(() => frameBreakDelay.value, (newValue) => {
    //     if (newValue < 0) {
    //         frameBreakReady = false;
    //         clearTimeout(frameBreakTimeoutID);
    //     } else if (newValue === 0) {
    //         frameBreakReady = true;
    //         clearTimeout(frameBreakTimeoutID);
    //     } else {
    //         refreshTimeout();
    //     }
    // }, {debounce: 300, immediate: true});

    // let frameBreakReady = false;
    // let frameBreakTimeoutID = setTimeout(() => {
    // }, 0);

    const dataArchive: IDataArchive[] = [];
    const dataBuf: IDataBuf[] = [];
    const dataBufLength = ref(0);

    /* actual data shown on screen */
    const dataFiltered: ShallowReactive<IDataBuf[]> = shallowReactive([]);
    const dataFilterAutoUpdate = ref(true);
    const acceptIncomingData = ref(false);

    // let frameBreakReady = false;
    // let frameBreakTimeoutID = setTimeout(() => {
    // }, 0);

    debouncedWatch(computedFilterValue, () => {
        dataFiltered.length = 0; // Clear the array efficiently
        if (computedFilterValue.value.length === 0) {
            dataFiltered.push(...dataBuf);
            filterChanged.value = true;
            return;
        }

        const index = dataFiltered.length;
        for (const item of dataBuf) {
            const index = isArrayContained(computedFilterValue.value, item.data);
            if (index >= 0) {
                dataFiltered.push(item);
            }
            filterChanged.value = true;
        }
    }, {debounce: 300});

    let batchDataUpdateIntervalID: number = -1;
    const batchUpdateTime = ref(80); /* ms */
    let batchStartIndex: number = 0;

    watch(batchUpdateTime, value => {
        if (batchDataUpdateIntervalID >= 0) {
            clearInterval(batchDataUpdateIntervalID);
            batchDataUpdateIntervalID = -1;
        }
        batchUpdate();
        if (dataFilterAutoUpdate.value && batchDataUpdateIntervalID < 0) {
            batchDataUpdateIntervalID = setInterval(batchUpdate, batchUpdateTime.value);
        }
    }, {immediate: true});

    setInterval(() => {
        dataBufLength.value = dataBuf.length;
    }, 500);

    function addString(item: string, isRX: boolean = false, doSend: boolean = false, type: number = 0) {
        const encoder = new TextEncoder();
        item = unescapeString(item);
        const encodedStr = encoder.encode(item);
        return addItem(encodedStr, isRX, doSend, type);
    }

    function addHexString(item: string, isRX: boolean = false, doSend: boolean = false, type: number = 0){
        if (item === "") {
            return addItem(new Uint8Array(0), isRX);
        }
        const hexArray = item.split(' ');
        // Map each hex value to a decimal (integer) and create a Uint8Array from these integers
        const uint8Array = new Uint8Array(hexArray.map(hex => parseInt(hex, 16)));
        return addItem(uint8Array, isRX, doSend, type);
    }

    function batchUpdate() {
        if (batchStartIndex >= dataBuf.length) {
            return;
        }

        /* handle data buf array */
        if (dataBuf.length >= 30000) {
            /* make array size to 15000 */
            const deleteCount = dataBuf.length - 30000 + 5000;
            batchStartIndex -= deleteCount;
            dataBuf.splice(0, deleteCount);
        }

        if (!dataFilterAutoUpdate.value) {
            return;
        }
        softRefreshFilterBuf();
    }

    function softRefreshFilterBuf(delayTime: number = 0) {
        /* handle filtered buf array */
        const totalBufLength = dataBuf.length - batchStartIndex + dataFiltered.length;

        if (batchStartIndex < 0) {
            dataFiltered.length = 1;
            dataFiltered.pop();
        } else if (totalBufLength >= 30000) {
            dataFiltered.splice(0, totalBufLength - 30000 + 5000);
        }

        if (!enableFilter.value || computedFilterValue.value.length === 0) {

            /* no filter, do normal push */
            if (batchStartIndex < 0) {
                dataFiltered.push(...dataBuf);
            } else {
                dataFiltered.push(...dataBuf.slice(batchStartIndex));
            }
            batchStartIndex = dataBuf.length;
        } else if (enableFilter.value && computedFilterValue.value.length !== 0) {
            for (let i = batchStartIndex; i < dataBuf.length; i++) {
                if (isArrayContained(computedFilterValue.value, dataBuf[i].data) >= 0) {
                    dataFiltered.push(dataBuf[i]);
                }
            }
            batchStartIndex = dataBuf.length;
        }
    }

    function addItem(item: Uint8Array, isRX: boolean, doSend: boolean = false, type: number = 0) {

        const t = new Date();

        // dataArchive.push({
        //     time: t.getMilliseconds(),
        //     isRX: isRX,
        //     data: u8arr,
        // });

        if (isRX) {
            RxTotalByteCount.value += item.length;
            RxByteCount.value = item.length;
        } else {
            /* append prefix and suffix */
            if (computedPrefixValue.value.length || computedSuffixValue.value.length) {
                const newArr = new Uint8Array(computedPrefixValue.value.length +
                    computedSuffixValue.value.length + item.length);
                newArr.set(computedPrefixValue.value);
                newArr.set(item, computedPrefixValue.value.length);
                newArr.set(computedSuffixValue.value, computedPrefixValue.value.length + item.length);
                item = newArr;
            }
            if (doSend) {
                /* INFO: hard coded for the moment */
                uart_send_msg(item);
            }
            TxTotalByteCount.value += item.length;
            TxByteCount.value = item.length;
        }

        let str = ""
        str = decodeUtf8(item);
        str = escapeHTML(str);
        str = strToHTML(str);

        /* unescape data \n */
        if (enableAnsiDecode.value) {
            if (isArrayContained(ANSI_CLEAR_WINDOW, item) >= 0) {
                clearFilteredBuff();
            }
            if (isArrayContained(ANSI_REFRESH_WINDOW, item) >= 0) {
                batchUpdate()
                softRefreshFilterBuf();
            }
            /* ansi_to_html will escape HTML sequence */
            str = ansi_up.ansi_to_html("\x1b[0m" + str);
        }

        dataBuf.push({
            time:
            "["
            + zeroPad(t.getHours(), 2) + ":"
            + zeroPad(t.getMinutes(), 2) + ":"
            + zeroPad(t.getSeconds(), 2) + ":"
            + zeroPad(t.getMilliseconds(), 3)
            + "]",
            type: type,
            data: item,
            isRX: isRX,
            str: str,
            hex: u8toHexString(item),
            hexdump: u8toHexdump(item),
        });
    }


    // function doFrameBreak() {
    //     frameBreakReady = true;
    // }


    // function refreshTimeout() {
    //     /* always break  */
    //     // if (frameBreakDelay.value === 0) {
    //     //     frameBreakReady = true;
    //     // }
    //
    //
    //     if (!frameBreakReady && frameBreakDelay.value > 0) {
    //         clearTimeout(frameBreakTimeoutID);
    //         frameBreakTimeoutID = setTimeout(doFrameBreak, frameBreakDelay.value);
    //     }
    // }

    // function addChunk(item: Uint8Array, isRX: boolean) {
    //     let newArray: Uint8Array;
    //
    //     if (frameBreakSequence.value === "") {
    //         if (frameBreakReady || dataBuf.length === 0 || dataBuf[dataBuf.length - 1].isRX != isRX) {
    //             addItem(item, isRX);
    //             frameBreakReady = false;
    //         } else {
    //             /* TODO: append item to last */
    //             newArray = new Uint8Array(dataBuf[dataBuf.length - 1].data.length + item.length + 1);
    //             newArray.set(dataBuf[dataBuf.length - 1].data);
    //             newArray.set(item, dataBuf[dataBuf.length - 1].data.length);
    //             popItem();
    //             addItem(newArray, isRX);
    //         }
    //         refreshTimeout();
    //         return;
    //     }
    //
    //
    //     if (frameBreakReady) {
    //         newArray = item;
    //     } else {
    //         if (dataBuf.length) {
    //             newArray = new Uint8Array(dataBuf[dataBuf.length - 1].data.length + item.length + 1);
    //             newArray.set(dataBuf[dataBuf.length - 1].data);
    //             newArray.set(item, dataBuf[dataBuf.length - 1].data.length);
    //             popItem();
    //         } else {
    //             newArray = item;
    //         }
    //     }
    //
    //     console.log(newArray)
    //     console.log(frameBreakSequenceNormalized.value)
    //
    //     /* break frame at sequence match */
    //     let matchIndex = isArrayContained(frameBreakSequenceNormalized.value, newArray);
    //     while (matchIndex < 0) {
    //         console.log(matchIndex)
    //         /* update last buf item */
    //         addItem(newArray.slice(0, matchIndex + frameBreakSequenceNormalized.value.length), isRX);
    //         newArray = newArray.slice(matchIndex + frameBreakSequenceNormalized.value.length);
    //         matchIndex = isArrayContained(frameBreakSequenceNormalized.value, newArray);
    //     }
    //     addItem(newArray.slice(0, matchIndex + frameBreakSequenceNormalized.value.length), isRX);
    // }

    function clearByteCount(isRX: boolean) {
        if (isRX) {
            RxTotalByteCount.value = 0;
        } else {
            TxTotalByteCount.value = 0;
        }
    }

    function clearDataBuff() {
        clearFilteredBuff();
        dataBuf.length = 0;
        dataBufLength.value = 0;
        batchStartIndex = 0;

        RxByteCount.value = 0;
        RxTotalByteCount.value = 0;

        TxByteCount.value = 0;
        TxTotalByteCount.value = 0;
    }

    function clearFilteredBuff() {
        showVirtualScroll.value = !showVirtualScroll.value;
        dataFiltered.length = 0;
    }

    function refreshFilteredBuff() {
        const oldValue = filterValue.value;
        filterValue.value += "66";
        filterValue.value = oldValue;
    }

    function setUartBaud(baud: number) {
        uartBaudReal.value = baud;
        for (let i = 0; i < uartBaudList.length; i++) {
            const difference = Math.abs(uartBaudList[i].baud - baud);
            const percentageDifference = (difference / baud);
            if (percentageDifference !== 0 && percentageDifference < 0.001) {
                uartBaud.value = uartBaudList[i].baud;
                return;
            }
        }
        uartBaud.value = baud;
    }

    return {
        addItem,
        addString,
        addHexString,
        clearFilteredBuff,
        clearDataBuff,
        refreshFilteredBuff,
        softRefreshFilterBuf,
        textSuffixValue,
        textPrefixValue,
        clearByteCount,
        dataBufLength,
        configPanelTab,
        configPanelShow,
        quickAccessPanelShow,
        dataFiltered,
        dataFilterAutoUpdate,
        filterValue,
        batchUpdateTime,
        acceptIncomingData,

        showVirtualScroll,

        enableAnsiDecode,
        showHex,
        showHexdump,
        showText,
        showTimestamp,
        enableLineWrap,
        RxHexdumpColor,
        TxHexdumpColor,
        predefineColors,
        RxByteCount,
        RxTotalByteCount,
        TxByteCount,
        TxTotalByteCount,
        forceToBottom,
        frameBreakSequence,
        frameBreakDelay,
        filterChanged,

        /* UART */
        predefinedUartBaudFrequent,
        uartBaudList,
        uartBaud,
        uartConfig,
        uartBaudReal,
        setUartBaud,
    }
});
