import {defineStore} from "pinia";
import {
    computed,
    type Ref,
    type ShallowReactive,
    ref,
    shallowReactive,
    watch,
} from "vue";
import {AnsiUp} from 'ansi_up'
import {debouncedWatch} from "@vueuse/core";
import {type IUartConfig, uart_send_msg} from "@/api/apiUart";
import {isDevMode} from "@/composables/buildMode";
import {useUartStore} from "@/stores/useUartStore";

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

function unescapeString(str: string): Uint8Array {
    const resultArray = [];
    let i = 0;

    while (i < str.length) {
        if (str[i] === '\\' && i + 1 < str.length) {
            i++;
            switch (str[i]) {
                case 'n':
                    resultArray.push(0x0A); // LF
                    break;
                case 'r':
                    resultArray.push(0x0D); // CR
                    break;
                case 't':
                    resultArray.push(0x09); // Tab
                    break;
                case 'b':
                    resultArray.push(0x08); // Backspace
                    break;
                case 'v':
                    resultArray.push(0x0B); // Vertical Tab
                    break;
                case '0':
                    resultArray.push(0x00); // Null
                    break;
                case 'x':
                    if (i + 2 < str.length) {
                        resultArray.push(parseInt(str.substr(i + 1, 2), 16));
                        i += 2;
                    }
                    break;
                case 'u':
                    if (i + 4 < str.length) {
                        const codePoint = parseInt(str.substr(i + 1, 4), 16);
                        if (codePoint < 0x80) {
                            resultArray.push(codePoint);
                        } else if (codePoint < 0x800) {
                            resultArray.push(192 | (codePoint >> 6));
                            resultArray.push(128 | (codePoint & 63));
                        } else if (codePoint < 0x10000) {
                            resultArray.push(224 | (codePoint >> 12));
                            resultArray.push(128 | ((codePoint >> 6) & 63));
                            resultArray.push(128 | (codePoint & 63));
                        } else {
                            resultArray.push(240 | (codePoint >> 18));
                            resultArray.push(128 | ((codePoint >> 12) & 63));
                            resultArray.push(128 | ((codePoint >> 6) & 63));
                            resultArray.push(128 | (codePoint & 63));
                        }
                        i += 4;
                    }
                    break;
                default:
                    // This handles any escaped character that is not a special character
                    resultArray.push(str[i].charCodeAt(0));
                    break;
            }
        } else {
            // This section now properly converts a direct character to UTF-8 when it's beyond the ASCII range
            const code = str.codePointAt(i);
            if (code == undefined) {
                continue
            }
            if (code < 0x80) {
                resultArray.push(code);
            } else if (code < 0x800) {
                resultArray.push(192 | (code >> 6));
                resultArray.push(128 | (code & 63));
            } else if (code < 0x10000) {
                resultArray.push(224 | (code >> 12));
                resultArray.push(128 | ((code >> 6) & 63));
                resultArray.push(128 | (code & 63));
            } else {
                resultArray.push(240 | (code >> 18));
                resultArray.push(128 | ((code >> 12) & 63));
                resultArray.push(128 | ((code >> 6) & 63));
                resultArray.push(128 | (code & 63));
                i++; // Move past the second part of the surrogate pair
            }
        }
        i++;
    }

    return new Uint8Array(resultArray);
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
        .replace(/\r/, '')
        .replace(/ /g, ' ');
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

function generateBaudArr(results: { baud: number; }[]) {
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

export interface ISettings {
    testNumber: number;
    configTab: string;
    showText: boolean;
    showHex: boolean;
    showHexdump: boolean;
    showTimestamp: boolean;
    lineWrap: boolean;
    RxHexdumpColor: string;
    TxHexdumpColor: string;
    frameBreakSequence: string;
    frameBreakAfterSequence: boolean;
    frameBreakDelay: number;
    frameBreakSize: number;
    frameBreak: any[]; // Specify more precise types
    decodeANSI: boolean;
    frameFilterValue: string;
    autoUpdate: boolean;
    updateInterval: number;
    sendFramePrefix: string;
    sendFrameSuffix: string;
    loopSendInterval: number;
    sendBoxIsText: boolean;
    sendBox: string;
    winLeft: any;
    winRight: any;
    winAutoLayout: boolean;
    winLayoutMode: string;
    macroButtons: macroItem[];
    ipChangeAlert: boolean;
}

interface macroItem {
    value: string;
    label: string;
    id: number;
}

export const useDataViewerStore = defineStore('text-viewer', () => {
    const uartStore = useUartStore()

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
    const enableAnsiDecode = ref(true);


    /*
     * FRAME BREAK STUFS
     * */

    let RxSegment: Uint8Array = new Uint8Array(0);
    const RxRemainHexdump = ref("");

    const frameBreakSequence = ref("\\n");
    const frameBreakAfterSequence = ref(true);
    const frameBreakSequenceNormalized = computed(() => {
        return unescapeString(frameBreakSequence.value);
    });
    const frameBreakDelay = ref(0);
    let frameBreakDelayTimeoutID: number = -1;

    function frameBreakFlush() {
        if (RxSegment.length) {
            addItem(RxSegment, true);
            RxSegment = new Uint8Array();
            RxRemainHexdump.value = "";
        }
    }

    function frameBreakRefreshTimout() {
        if (frameBreakDelay.value > 0) {
            if (frameBreakDelayTimeoutID >= 0) {
                clearTimeout(frameBreakDelayTimeoutID);
                frameBreakDelayTimeoutID = -1;
            }
            frameBreakDelayTimeoutID = setTimeout(() => {
                frameBreakFlush()
            }, frameBreakDelay.value);
        } else {
            if (frameBreakDelayTimeoutID >= 0) {
                clearTimeout(frameBreakDelayTimeoutID);
                frameBreakDelayTimeoutID = -1;
            }
            if (frameBreakDelay.value === 0) {
                frameBreakFlush();
            }
        }
    }

    debouncedWatch(() => frameBreakDelay.value, () => {
        frameBreakRefreshTimout();
        console.log("timeout called");
    }, {debounce: 300});



    const frameBreakSize = ref(0);
    const frameBreakRules = ref([{
        name: '超时(ms)',
        type: 'number',
        min: -1,
        draggable: false,
        transformData: breakDelay,
    }, {
        name: '匹配',
        type: 'text',
        draggable: true,
        transformData: breakSequence,
    }, {
        name: '字节(B)',
        type: 'number',
        min: 0,
        draggable: true,
        transformData: breakSize,
    },])

    function breakDelay(inputArray: Uint8Array[]) {
        return {result: [] as Uint8Array[], remain: true};
    }

    function breakSequence(inputArray: Uint8Array[]) {
        if (frameBreakSequenceNormalized.value.length <= 0) {
            return {result: inputArray, remain: true};
        }
        const result: Uint8Array[] = [];
        /* if split after, the matched array is appended to the previous */
        const appendedLength = frameBreakAfterSequence.value ? frameBreakSequenceNormalized.value.length : 0;
        /* else after the first match, skip the matchArr at the beginning of array in subsequent match */
        const skipLength = frameBreakAfterSequence.value ? 0 : frameBreakSequenceNormalized.value.length;
        let startIndex = 0;

        inputArray.forEach(array => {
            startIndex = 0;
            let matchIndex = isArrayContained(frameBreakSequenceNormalized.value, array, 0, startIndex);

            while (matchIndex !== -1) {
                const endIndex = matchIndex + appendedLength;
                if (startIndex !== endIndex) {
                    result.push(array.subarray(startIndex, endIndex));
                }
                startIndex = endIndex;
                matchIndex = isArrayContained(frameBreakSequenceNormalized.value, array,
                    0, startIndex + skipLength);
            }
            // Add the last segment if there's any remaining part of the array
            if (startIndex < array.length) {
                result.push(array.subarray(startIndex, array.length));
            }
        });
        const remain = startIndex < inputArray[inputArray.length - 1].length;
        return {result, remain};
    }

    function breakSize(inputArray: Uint8Array[]) {
        if (frameBreakSize.value <= 0) {
            return {result: inputArray, remain: true};
        }
        const result: Uint8Array[] = [];
        inputArray.forEach(item => {
            for (let start = 0; start < item.length; start += frameBreakSize.value) {
                const end = Math.min(start + frameBreakSize.value, item.length);
                result.push(item.subarray(start, end));
            }
        });
        const remain = result[result.length - 1].length < frameBreakSize.value;
        return {result, remain};
    }

    function reloadFrameBreak() {
        /* function and ref can not be stored in localStorage */
        for (let i = 0; i < frameBreakRules.value.length; i++) {
            if (frameBreakRules.value[i].name === "超时(ms)") {
                frameBreakRules.value[i].transformData = breakDelay;
            } else if (frameBreakRules.value[i].name === "匹配") {
                frameBreakRules.value[i].transformData = breakSequence;
            } else {
                frameBreakRules.value[i].transformData = breakSize;
            }
        }
    }

    function addStringMessage(input: string, isRX: boolean, doSend: boolean = false) {
        const unescaped = unescapeString(input);
        addSegment(unescaped, isRX, doSend);
    }

    function addSegment(input: Uint8Array, isRX: boolean, doSend: boolean = false) {
        if (input.length <= 0) {
            if (isDevMode()) {
                console.log("input size =0");
            }
            return;
        }

        let frames: Uint8Array[] = []
        const data= new Uint8Array(RxSegment.length + input.length);
        let remain = true;
        data.set(RxSegment);
        data.set(input, RxSegment.length);
        RxSegment = data;

        frames.push(RxSegment);
        /* ready for adding new items */
        for (let i = 1; i < frameBreakRules.value.length; i++) {
            const ret: {result: Uint8Array[], remain: boolean} = frameBreakRules.value[i].transformData(frames);
            /* check if last item changed */
            if (!ret.remain || ret.result[ret.result.length - 1].length !== frames[frames.length - 1].length) {
                remain = ret.remain;
            }
            frames = ret.result;
        }

        if (frameBreakDelay.value !== 0 && remain) {
            RxSegment = frames.pop() || new Uint8Array();
            if (frameBreakDelay.value > 0) {
                frameBreakRefreshTimout();
            }
        } else {
            RxSegment = new Uint8Array();
        }

        for (let i = 0; i < frames.length; i++) {
            addItem(frames[i], isRX, doSend);
        }

        if (RxSegment.length > 8192) {
            addItem(RxSegment, isRX, doSend);
            RxSegment = new Uint8Array();
        }
    }

    const frameBreakRet = {
        frameBreakSequence,
        frameBreakAfterSequence,
        frameBreakDelay,
        frameBreakSize,
        frameBreakRules,
        RxRemainHexdump,
        addStringMessage,
        addSegment,
    }

    const showText = ref(true);
    const showHex = ref(false);
    const showHexdump = ref(false);
    const enableLineWrap = ref(false);
    const showTimestamp = ref(true);
    const showVirtualScroll = ref(true);

    const RxHexdumpColor = ref("#f0f9eb");
    const RxTotalByteCount = ref(0);
    const RxByteCount = ref(0);

    const TxHexdumpColor = ref("#ecf4ff");
    const TxTotalByteCount = ref(0);
    const TxByteCount = ref(0);

    let TxByteCountLocal = 0;
    let TxTotalByteCountLocal = 0;
    let RxByteCountLocal = 0;
    let RxTotalByteCountLocal = 0;

    function clearRxCounter() {
        RxByteCountLocal = 0;
        RxTotalByteCountLocal = 0;
    }

    function clearTxCounter() {
        TxByteCountLocal = 0;
        TxTotalByteCountLocal = 0;
    }

    const enableFilter = ref(true);
    const forceToBottom = ref(true);
    const filterChanged = ref(false);

    const textPrefixValue = ref("");
    const textSuffixValue = ref("\\r\\n");
    const hasAddedText = computed(() => {
        return textPrefixValue.value.length > 0 || textSuffixValue.value.length > 0;
    });

    const uartBaud = ref(115200);
    const uartBaudReal = ref(115200);
    const uartConfig: Ref<IUartConfig> = ref({
        data_bits: 8,
        parity: 0,
        stop_bits: 1,
    });

    const filterValue = ref('');
    const computedFilterValue = computed(() => {
        return unescapeString(filterValue.value);
    })

    const computedSuffixValue = computed(() => {
        return unescapeString(textSuffixValue.value);
    })

    const computedPrefixValue = computed(() => {
        return unescapeString(textPrefixValue.value);
    })

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
        refreshFilteredBuff()
    }, {debounce: 300});

    let batchDataUpdateIntervalID: number = -1;
    const batchUpdateTime = ref(80); /* ms */
    let batchStartIndex: number = 0;

    watch(batchUpdateTime, () => {
        if (batchDataUpdateIntervalID >= 0) {
            clearInterval(batchDataUpdateIntervalID);
            batchDataUpdateIntervalID = -1;
        }
        batchUpdate();
        if (dataFilterAutoUpdate.value && batchDataUpdateIntervalID < 0) {
            batchDataUpdateIntervalID = setInterval(batchUpdate, batchUpdateTime.value);
        }
    }, {immediate: true});

    /* delayed value update, prevent quick unnecessary update */
    setInterval(() => {
        dataBufLength.value = dataBuf.length;
        TxByteCount.value = TxByteCountLocal;
        TxTotalByteCount.value = TxTotalByteCountLocal;
        RxByteCount.value = RxByteCountLocal;
        RxTotalByteCount.value = RxTotalByteCountLocal;
        if (RxSegment.length) {
            RxRemainHexdump.value = u8toHexdump(RxSegment);
        } else {
            RxRemainHexdump.value = "";
        }
    }, 200);

    function addString(item: string, isRX: boolean = false, doSend: boolean = false, type: number = 0) {
        console.log(item);
        const unescaped = unescapeString(item);
        return addItem(unescaped, isRX, doSend, type);
    }

    function addHexString(item: string, isRX: boolean = false, doSend: boolean = false, type: number = 0) {
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

    function softRefreshFilterBuf() {
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
        if (!acceptIncomingData.value && isRX) {
            return;
        }
        const t = new Date();

        // dataArchive.push({
        //     time: t.getMilliseconds(),
        //     isRX: isRX,
        //     data: u8arr,
        // });

        if (isRX) {
            RxTotalByteCountLocal += item.length;
            RxByteCountLocal = item.length;
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
            if (acceptIncomingData.value) {
                if (doSend) {
                    /* INFO: hard coded for the moment */
                    uart_send_msg(item, uartStore.uartNum);
                }
            } else {
                type = 1;
            }
            TxTotalByteCountLocal += item.length;
            TxByteCountLocal = item.length;
        }

        let str: string;
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

    function clearByteCount(isRX: boolean) {
        if (isRX) {
            RxTotalByteCountLocal = 0;
        } else {
            TxTotalByteCountLocal = 0;
        }
    }

    function clearDataBuff() {
        clearFilteredBuff();
        dataBuf.length = 0;
        dataBufLength.value = 0;
        batchStartIndex = 0;

        RxByteCountLocal = 0;
        RxTotalByteCountLocal = 0;
        TxByteCountLocal = 0;
        TxTotalByteCountLocal = 0;

        RxSegment = new Uint8Array();
        RxRemainHexdump.value = "";
    }

    function clearFilteredBuff() {
        /* prevent virtual scroll not displaying new data */
        showVirtualScroll.value = !showVirtualScroll.value;
        /* the actual clear buff clear */
        dataFiltered.length = 0;
    }

    function refreshFilteredBuff() {
        clearFilteredBuff()
        for (const item of dataBuf) {
            const index = isArrayContained(computedFilterValue.value, item.data);
            if (index >= 0 || filterValue.value.length === 0) {
                dataFiltered.push(item);
            }
        }
        filterChanged.value = true;
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


    const enableLoopSend = ref(false);
    const loopSendFreq = ref(1000);
    let loopSendIntervalID: number = -1;
    const sendBox = ref("");
    const sendBoxIsText = ref(true);
    const isHexStringValid = ref(false);

    function loopSend() {
        if (!acceptIncomingData.value) {
            enableLoopSend.value = false;
        }

        if (sendBoxIsText.value) {
            addString(sendBox.value, false, true);
        } else {
            if (!isHexStringValid.value) {
                addString("HEX格式错误", false, false, 1);
                addHexString(sendBox.value, false, false, 1);
            } else {
                addHexString(sendBox.value, false, true);
            }
        }
    }

    watch(enableLoopSend, (newValue) => {
        if (newValue) {
            if (loopSendIntervalID !== -1) {
                clearInterval(loopSendIntervalID);
            }
            loopSendIntervalID = setInterval(loopSend, loopSendFreq.value);
        } else {
            clearInterval(loopSendIntervalID);
            loopSendIntervalID = -1;
        }
    });

    watch(loopSendFreq, (value) => {
        if (enableLoopSend.value && value) {
            /* update interval with new value */
            if (loopSendIntervalID !== -1) {
                clearInterval(loopSendIntervalID);
            }
            loopSendIntervalID = setInterval(loopSend, loopSendFreq.value);
        }
    })

    const loopSendRet = {
        enableLoopSend,
        loopSendFreq,
        loopSendIntervalID,
        isSendTextFormat: sendBoxIsText,
        uartInputTextBox: sendBox,
        isHexStringValid,
    }

    interface WinProperty {
        show: boolean;
        width: string;
        height: string;
        borderSize: number;
    }

    /* window layout */
    const winLeft = ref({
        show: true,
        width: "100px",
        height: "100px",
        borderSize: 3,
    });

    /* window layout */
    const winRight = ref({
        show: true,
        width: "100px",
        height: "100px",
        borderSize: 3,
    });

    const winAutoLayout = ref(true);
    const winLayoutMode = ref('row');


    const winLayoutRet = {
        winLeft,
        winRight,
        winAutoLayout,
        winLayoutMode,
    }

    /* macro buttons */

    const macroData: Ref<macroItem[]> = ref([
        {
            value: 'AT',
            label: '测试AT',
            id: 1,
        },{
            value: 'AT+CSQ',
            label: '询信号强度',
            id: 2,
        },{
            value: 'AT+CGSN',
            label: '询序列号',
            id: 3,
        }, {
            value: 'AT+CGMR',
            label: '询固件版本',
            id: 4,
        }, {
            value: 'AT+CMEE',
            label: '询终端报错',
            id: 5,
        }, {
            value: 'AT+NRB',
            label: '重启',
            id: 6,
        }, {
            value: 'AT+CGATT',
            label: '询网络激活状态',
            id: 7,
        }, {
            value: 'AT+CEREG',
            label: '询网络注册状态',
            id: 8,
        }, {
            value: 'AT+CSCON',
            label: '询网络连接状态',
            id: 9,
        }
    ]);
    const macroId = ref(10);

    const macroDataRet = {
        macroData,
        macroId,
    }


    const autoSaveSettings = ref(true);
    /* save to localStorage */
    const testNumber = ref(0);
    const ipChangeAlert = ref(true);

    const settings: Ref<ISettings> = ref({
        testNumber,
        macroButtons: macroData,

        configTab: configPanelTab,
        showHex,
        showText,
        showHexdump,
        showTimestamp,
        lineWrap: enableLineWrap,
        RxHexdumpColor,
        TxHexdumpColor,

        frameBreak: frameBreakRules,
        frameBreakSequence,
        frameBreakSize,
        frameBreakDelay,
        frameBreakAfterSequence,
        frameFilterValue: filterValue,
        decodeANSI: enableAnsiDecode,
        autoUpdate: dataFilterAutoUpdate,
        updateInterval: batchUpdateTime,
        sendFramePrefix: textPrefixValue,
        sendFrameSuffix: textSuffixValue,
        loopSendInterval: loopSendFreq,
        sendBoxIsText,
        sendBox,
        winRight,
        winLeft,
        winAutoLayout,
        winLayoutMode,
        ipChangeAlert,
    });

    const settingsName = "uart-settings";

    watch(() => settings, () => {
        if (autoSaveSettings.value) {
            localStorage.setItem(settingsName, JSON.stringify(settings.value));
        }
    }, {deep: true});

    function loadSettings(settingsData: string = "") {
        let data: string | null = settingsData;
        if (settingsData === "") {
            data = localStorage.getItem(settingsName);
        }
        if (data) {
            // Assuming the stored data is a JSON string
            const parsedData = JSON.parse(data);
            if (parsedData.macroButtons !== undefined) {
                macroData.value = parsedData.macroButtons;
            }
            if (parsedData.configTab !== undefined) {
                configPanelTab.value = parsedData.configTab;
            }
            if (parsedData.showText !== undefined) {
                showText.value = parsedData.showText;
            }
            if (parsedData.showHex !== undefined) {
                showHex.value = parsedData.showHex;
            }
            if (parsedData.showHexdump !== undefined) {
                showHexdump.value = parsedData.showHexdump;
            }
            if (parsedData.showTimestamp !== undefined) {
                showTimestamp.value = parsedData.showTimestamp;
            }
            if (parsedData.lineWrap !== undefined) {
                enableLineWrap.value = parsedData.lineWrap;
            }
            if (parsedData.RxHexdumpColor !== undefined) {
                RxHexdumpColor.value = parsedData.RxHexdumpColor;
            }
            if (parsedData.TxHexdumpColor !== undefined) {
                TxHexdumpColor.value = parsedData.TxHexdumpColor;
            }
            if (parsedData.frameBreakSequence !== undefined) {
                frameBreakSequence.value = parsedData.frameBreakSequence;
            }
            if (parsedData.frameBreakAfterSequence !== undefined) {
                frameBreakAfterSequence.value = parsedData.frameBreakAfterSequence;
            }
            if (parsedData.frameBreakDelay !== undefined) {
                frameBreakDelay.value = parsedData.frameBreakDelay;
            }
            if (parsedData.frameBreakSize !== undefined) {
                frameBreakSize.value = parsedData.frameBreakSize;
            }

            if (parsedData.frameBreak !== undefined) {
                frameBreakRules.value = parsedData.frameBreak;
            }
            if (parsedData.decodeANSI !== undefined) {
                enableAnsiDecode.value = parsedData.decodeANSI;
            }
            if (parsedData.frameFilterValue !== undefined) {
                filterValue.value = parsedData.frameFilterValue;
            }
            if (parsedData.autoUpdate !== undefined) {
                dataFilterAutoUpdate.value = parsedData.autoUpdate;
            }
            if (parsedData.updateInterval !== undefined) {
                batchUpdateTime.value = parsedData.updateInterval;
            }

            if (parsedData.sendFramePrefix !== undefined) {
                textPrefixValue.value = parsedData.sendFramePrefix;
            }
            if (parsedData.sendFrameSuffix !== undefined) {
                textSuffixValue.value = parsedData.sendFrameSuffix;
            }

            if (parsedData.loopSendInterval !== undefined) {
                loopSendFreq.value = parsedData.loopSendInterval;
            }
            if (parsedData.sendBoxIsText !== undefined) {
                sendBoxIsText.value = parsedData.sendBoxIsText;
            }
            if (parsedData.sendBox !== undefined) {
                sendBox.value = parsedData.sendBox;
            }

            if (parsedData.winLeft !== undefined) {
                winLeft.value = parsedData.winLeft;
            }
            if (parsedData.winRight !== undefined) {
                winRight.value = parsedData.winRight;
            }
            if (parsedData.winAutoLayout !== undefined) {
                winAutoLayout.value = parsedData.winAutoLayout;
            }
            if (parsedData.winLayoutMode !== undefined) {
                winLayoutMode.value = parsedData.winLayoutMode;
            }
            if (parsedData.ipChangeAlert !== undefined) {
                ipChangeAlert.value = parsedData.ipChangeAlert;
            }

            reloadFrameBreak();
            macroId.value = macroData.value.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        }
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
        hasAddedText,
        clearByteCount,
        dataBufLength,
        configPanelTab,
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
        clearRxCounter,
        clearTxCounter,
        forceToBottom,
        filterChanged,

        ...frameBreakRet,

        /* UART */
        predefinedUartBaudFrequent,
        uartBaudList,
        uartBaud,
        uartConfig,
        uartBaudReal,
        setUartBaud,
        ...loopSendRet,
        ...winLayoutRet,
        ...macroDataRet,

        autoSaveSettings,
        settings,
        testNumber,
        loadSettings,
        ipChangeAlert,
    }
});
