<template>
  <div class="flex min-h-7 overflow-auto">
    <el-popover
        placement="bottom"
        trigger="click"
        :hide-after="0"
        transition="none"
        width="300"
    >
      <div v-if="!store.configPanelShow" class="h-[40vh] overflow-auto">
        <text-data-config></text-data-config>
      </div>
      <template #reference>
        <el-link v-show="!store.configPanelShow" type="primary">
          <InlineSvg name="arrow_drop_down" class="h-6 mb-1 px-2"></InlineSvg>
        </el-link>
      </template>
    </el-popover>

    <div class="flex">
      <el-checkbox size="small" v-model="store.forceToBottom" label="强制滚动至底部" border/>
      <el-tooltip
          class="box-item"
          effect="light"
          placement="top"
      >
        <template #content>
          <p>仅清除显示区域，可用刷新恢复</p>
        </template>
        <el-button size="small" @click="store.clearFilteredBuff">
          <InlineSvg class="h-5" name="trash"></InlineSvg>
          清屏 ⇩
        </el-button>
      </el-tooltip>

      <el-tooltip
          class="box-item"
          effect="light"
          placement="top"
      >
        <template #content>
          <p>与缓存同步</p>
        </template>
        <el-button size="small" @click="store.refreshFilteredBuff">
          刷新
        </el-button>
      </el-tooltip>

<!--      <el-checkbox class="hover:bg-blue-200" size="small" v-model="store.pauseAutoRefresh" label="暂停数据刷新" border/>-->
    </div>


        <div class="flex">
          <el-button size="small" @click="addItem(1)">add1</el-button>
          <el-button size="small" @click="addItem(10)">add10</el-button>
          <el-button size="small" @click="addItem(100)">add100</el-button>
          <el-button size="small" @click="addItem(1000)">add1000</el-button>
          <el-button size="small" @click="scrollToBottom">scrollToBottom</el-button>
<!--          <el-button @click="toggleAutoBottom">autoBot: {{ forceToBottom }}</el-button>-->
<!--          <el-checkbox size="small" v-model="store.forceToBottom" :label="'autoBot:' + store.forceToBottom" border></el-checkbox>-->
<!--          <el-button>{{ count }}, {{ items.length }}, {{ vuetifyVirtualScrollBarRef.scrollTop }},-->
<!--            {{ vuetifyVirtualScrollBarRef.clientHeight }}, {{ vuetifyVirtualScrollBarRef.scrollHeight }}-->
<!--          </el-button>-->
<!--          <el-button @click="updateScroll">{{ scrollTop }}, {{ clientHeight }}, {{ scrollHeight }}</el-button>-->
        </div>

<!--    <div>-->
<!--      <el-popover-->
<!--          placement="bottom"-->
<!--          trigger="click"-->
<!--          :hide-after="0"-->
<!--          transition="none"-->
<!--          width="300"-->
<!--      >-->
<!--        <div id="quick-access-panel-tp" class="bg-amber-200"></div>-->
<!--        <template #reference>-->
<!--          <el-link class="content-center" v-show="!store.quickAccessPanelShow">-->
<!--            <InlineSvg name="arrow_drop_down" class="h-7"></InlineSvg>-->
<!--            666-->
<!--          </el-link>-->
<!--        </template>-->
<!--      </el-popover>-->
<!--    </div>-->
  </div>

  <div class="flex flex-grow overflow-hidden border-2 scroll-m-2">
    <v-virtual-scroll
        :items="store.dataFiltered"
        id="myScrollerID"
        ref="vuetifyVirtualScrollRef"
        class="font-mono break-all text-sm"
        :class="[store.enableLineWrap ? 'break-all' : 'text-nowrap']"
    >
      <template v-slot:default="{ item, }">
        <div>
          <div class="flex">
            <p class="text-nowrap text-sm text-lime-500" v-if="item.isRX" type="success" v-show="store.showTimestamp"><span>{{ item.time }}</span>◄-RX|</p>
            <p class="text-nowrap text-sm text-sky-500" v-else type="primary" v-show="store.showTimestamp"><span>{{ item.time }}</span>TX-►|</p>
            <p v-show="store.showText"
               v-html="item.str"></p>
          </div>
          <div class="flex text-wrap">
            <p v-show="store.showHex" class="">{{ item.hex }}</p>
          </div>
          <div class="flex">
            <p v-show="store.showHexdump"
               class="text-nowrap"
                 :style="{ 'background-color': item.isRX ? store.RxHexdumpColor : store.TxHexdumpColor }"
               v-html="item.hexdump"
            ></p>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>

  <div class="shrink-0 min-h-6 flex gap-2 justify-between overflow-y-scroll">
    <div class="flex gap-2">
      <el-link @click="clearSendInput">
        <el-tag class="font-mono" size="small">
          <div class="flex ">
            <InlineSvg class="h-5" name="trash"></InlineSvg>
            <span class="content-end text-xs">⇩</span>
          </div>
        </el-tag>
      </el-link>

      <div class="flex align-center">
        <el-checkbox v-model="enableLoopSend" class="font-mono font-bold max-h-5" size="small" border>
          循环发送(ms)
        </el-checkbox>
        <el-input-number
            v-model="loopSendFreq"
            class="h-5"
            size="small"
            :step="10"
        >
        </el-input-number>
      </div>

      <el-link @click="isSendTextFormat = !isSendTextFormat">
        <el-tag class="font-mono font-bold" size="small">发送格式：{{ isSendTextFormat ? "文本" : "HEX" }}</el-tag>
      </el-link>
    </div>
    <div class="flex gap-2">
      <el-link @click="showTxTotalByte = !showTxTotalByte">
        <el-tag class="font-mono font-bold" size="small">
          {{ showTxTotalByte ? `TX统计:${store.TxTotalByteCount}B`: `上个TX帧:${store.TxByteCount}B` }}
        </el-tag>
      </el-link>
      <el-link type="success" @click="showRxTotalByte = !showRxTotalByte">
        <el-tag class="font-mono font-bold" size="small" type="success">
          {{ showRxTotalByte ? `RX统计:${store.RxTotalByteCount}B`: `上个RX帧:${store.RxByteCount}B` }}
        </el-tag>
      </el-link>
      <div class="flex align-center">
        <el-tag class="font-mono font-bold" size="small" type="info">
          <el-link class="flex" @click="store.clearDataBuff" type="warning">
            <InlineSvg class="h-5" name="trash"></InlineSvg>
          </el-link>
          <span class="align-text-bottom">缓存帧数: {{ store.dataBufLength }}/20000</span>
        </el-tag>
      </div>
    </div>
  </div>
  <div class="flex flex-row font-mono">
    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6}" v-model="uartInputTextBox" clearable
              :placeholder="isSendTextFormat ?
              '输入文本，支持\\n\\x转义' :
              '输入HEX格式'"
              @keydown="handleTextboxKeydown"
    ></el-input>
    <el-tooltip content="Ctrl+回车" placement="top" :auto-close="500">
      <el-button type="primary"
                 @click="onSendClick">
        {{ (isSendTextFormat || isHexStringValid) ? "发送" : "格式化" }}
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {useDataViewerStore} from "@/stores/dataViewerStore";
import InlineSvg from "@/components/InlineSvg.vue";
import TextDataConfig from "@/views/text-data-viewer/textDataConfig.vue";

const count = ref(0);
const showTxTotalByte = ref(false);
const showRxTotalByte = ref(false);
const vuetifyVirtualScrollRef = ref(document.body);
const vuetifyVirtualScrollBarRef = ref(document.body);
const vuetifyVirtualScrollContainerRef = ref(document.body);

const enableLoopSend = ref(false);
const loopSendFreq = ref(1000);
let loopSendIntervalID: number;
const isSendTextFormat = ref(true)
const isHexStringValid = ref(false);

const uartInputTextBox = ref("")
const store = useDataViewerStore();

const mutationObserver = new MutationObserver(() => {
  if (store.forceToBottom) {
    scrollToBottom();
  }
});

onMounted(() => {
  const parent = document.getElementById('myScrollerID') || document.body;

  // used to scroll to bottom
  vuetifyVirtualScrollBarRef.value = parent || document.body;

  // used to monitor height changes, so that one new Items are rendered, the height change -> scroll to bottom
  vuetifyVirtualScrollContainerRef.value = parent.querySelector('.v-virtual-scroll__container') || document.body;

  vuetifyVirtualScrollBarRef.value.onscroll = handleScroll;

  if (vuetifyVirtualScrollContainerRef.value) {
    const config = { childList: true, subtree: true, attributes: true };
    mutationObserver.observe(vuetifyVirtualScrollBarRef.value, config)
  }
})

onUnmounted(() => {
  mutationObserver.disconnect();
});


function addItem(nr: number) {
  let rawText = "";

  let maxcount = count.value + nr;

  for (; count.value < maxcount; count.value++) {
    let text = "";
    if ((count.value & 3) === 3) {
      text = `<p class="border-4">${count.value}inputasdf<br/>${count.value}asdf <br/>${count.value}asdfasdf <br/>${count.value}asdf </p>`;
      text += text;

    } else if ((count.value & 2) === 2) {
      text = `<p class="border-4">${count.value}inputas  df2<br/>${count.value} asdf asd  <br/>${count.value}fasdf asdf </p>`;
      text += text;
    } else if ((count.value & 1) === 1) {
      text = `<p class="border-4">${count.value}inputas  df2asdf asd  <br/>${count.value}fasdf asdf ${count.value} </p>`;
      text += text;
    } else {
      text = `<p class="border-4">${count.value}inputasa<br/>jdhfklasjdhfklasdhflasidfhilasdfhlasdiufhlasdkfhuasnlfcyerhfcibnkuaweghnfctiklaweuyrchnlaweirtucgnawertkcgyawertcnawelcrvnawgervcawencrgf${count.value} </p>`;
    }

    rawText = count.value + "<p class=\"border-4\"> 666666666b\n6666      666\x1b[33m6666666666666666666666666</p>b\n"
    const encoder = new TextEncoder();
    const arr = encoder.encode(rawText);
    store.addItem(arr, true);
  }
}

function scrollToBottom() {
  nextTick(() => {
    const scrollerElement = vuetifyVirtualScrollBarRef.value; // Adjust according to your setup
    // scrollerElement.scrollTop = scrollerElement.scrollHeight;
    scrollerElement.scrollTo(scrollerElement.scrollLeft, scrollerElement.scrollHeight);
  });
}

function scrollToTop() {
  nextTick(() => {
    vuetifyVirtualScrollBarRef.value.scrollTop = vuetifyVirtualScrollBarRef.value.scrollHeight;
    // vuetifyVirtualScrollBarRef.value.scrollTo(0, 0);
  });
}

function formatHexInput(input: string) {
  // Split the input string on spaces to process each segment separately
  let str;

  // Remove any "0x" prefix and handle uppercase conversion
  str = input.replace(/^0x/i, ' ').toUpperCase();

  // Remove any non-hexadecimal characters
  str = str.replace(/[^0-9A-F]/gi, ' ');

  let segments = str.split(/\s+/);
  let output:string[] = [];

  segments.forEach(segment => {
    // Check if segment length is odd and needs padding
    if (segment.length % 2 !== 0) {
      segment = '0' + segment; // Prepend '0' to make the length even
    }

    // Split segment into array of two-character chunks
    let chunked = [];
    for (let i = 0; i < segment.length; i += 2) {
      chunked.push(segment.substring(i, i + 2));
    }

    // Concatenate chunked segments and add to output
    output.push(chunked.join(' '));
  });

  // Join all processed segments with a space and return
  return output.join(' ');
}

function checkHexTextValid() {
  isHexStringValid.value = uartInputTextBox.value.toUpperCase() === formatHexInput(uartInputTextBox.value);
}

watch(isSendTextFormat, (value) => {
  if (!value) {
    checkHexTextValid()
  }
});

watch(() => uartInputTextBox.value, (newValue) => {
  if (!isSendTextFormat.value) {
    checkHexTextValid()
  }
})

watch(enableLoopSend, (newValue) => {
  if (newValue) {
    clearInterval(loopSendIntervalID);
    loopSendIntervalID = setInterval(onSendClick, loopSendFreq.value);
  } else {
    clearInterval(loopSendIntervalID);
  }
});

watch(loopSendFreq, (value) => {
  if (enableLoopSend.value && value) {
    /* update interval with new value */
    clearInterval(loopSendIntervalID);
    loopSendIntervalID = setInterval(onSendClick, loopSendFreq.value);
  }
})

/* patch scroll container does not update clear filter */
watch(() => store.filterChanged, (value) => {
  if (value) {
    scrollToBottom();
    scrollToTop()
    store.filterChanged = false;
  }
})

const handleScroll = (ev: Event) => {
  if (store.forceToBottom) {
    setTimeout(scrollToBottom, 0);
  }
};

function clearSendInput() {
  uartInputTextBox.value = ""
}

function handleTextboxKeydown(ev: KeyboardEvent) {
  if (ev.ctrlKey && ev.key === 'Enter') {
    onSendClick();
  }
}

function onSendClick() {
  if (isSendTextFormat.value) {
    store.addString(uartInputTextBox.value, false, true);
  } else if (!isHexStringValid.value) {
    uartInputTextBox.value = formatHexInput(uartInputTextBox.value);
  } else {
    store.addHexString(uartInputTextBox.value, false, true);
  }
}

</script>
