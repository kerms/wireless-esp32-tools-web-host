<template>
  <div class="flex min-h-7 overflow-auto">
    <el-popover
        placement="bottom"
        trigger="click"
        :hide-after="0"
        transition="none"
        width="300"
    >
      <div v-if="showDataConfig" class="h-[40vh] overflow-auto">
        <text-data-config></text-data-config>
      </div>
      <template #reference>
        <el-link v-show="showDataConfig" type="primary">
          <InlineSvg name="arrow_drop_down" class="h-6 mb-1 px-2"></InlineSvg>
        </el-link>
      </template>
    </el-popover>

    <div class="flex">
      <el-checkbox size="small" v-model="store.forceToBottom" :label="translate('uart.autoScrollToBottom')" border/>
      <el-tooltip
          class="box-item"
          effect="light"
          placement="top"
      >
        <template #content>
          <p>{{ translate('uart.clearTooltip') }}</p>
        </template>
        <el-button size="small" @click="store.clearFilteredBuff">
          <InlineSvg class="h-5" name="trash"></InlineSvg>
          {{ $t('uart.clearScreen') }} ⇩
        </el-button>
      </el-tooltip>

      <el-tooltip
          class="box-item"
          effect="light"
          placement="top"
      >
        <template #content>
          <p>{{ translate('uart.clearTooltip') }}</p>
        </template>
        <el-button size="small" @click="store.refreshFilteredBuff">
          {{ $t('page.update') }}
        </el-button>
      </el-tooltip>
      <el-tooltip
          class="box-item"
          effect="light"
          placement="top"
      >
        <template #content>
          <p>{{ translate('uart.autoUpdateTooltip') }}</p>
        </template>
        <el-checkbox size="small" border v-model="store.dataFilterAutoUpdate">
          {{ $t('uart.autoUpdate') }}
        </el-checkbox>
      </el-tooltip>
    </div>
  </div>

  <div class="flex flex-grow overflow-hidden border-2 rounded scroll-m-2">
    <v-virtual-scroll
        v-if="store.showVirtualScroll"
        :items="store.dataFiltered"
        id="myScrollerID"
        ref="vuetifyVirtualScrollRef"
        class="font-mono break-all text-sm"
        :class="[store.enableLineWrap ? 'break-all' : 'text-nowrap']"
    >
      <template v-slot:default="{ item, }">
        <div class="">
          <div class="flex" :class="[store.enableLineWrap ? 'whitespace-pre-wrap' : 'whitespace-pre']">
            <p class="text-nowrap text-sm text-lime-500" v-if="item.isRX" type="success" v-show="store.showTimestamp">
              <span>{{ item.time }}</span>◄-RX|</p>
            <p class="text-nowrap text-sm text-sky-500" v-else-if="item.type === 0" type="primary" v-show="store.showTimestamp">
              <span>{{ item.time }}</span>TX-►|</p>
            <p class="text-nowrap text-sm text-amber-800" v-else type="primary" v-show="store.showTimestamp">
              <span>{{ item.time }}</span>NS-►|</p>

            <p v-show="store.showText"
               v-html="item.str"></p>
          </div>
          <div class="flex">
            <p v-show="store.showHex" class="">{{ item.hex }}</p>
          </div>
          <div class="flex whitespace-pre">
            <p v-show="store.showHexdump"
               class="text-nowrap"
               :style="{ 'background-color': item.isRX ? store.RxHexdumpColor : store.TxHexdumpColor }"
               v-html="item.hexdump"
            ></p>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
    <v-virtual-scroll
        v-else
        :items="store.dataFiltered"
        id="myScrollerID"
        ref="vuetifyVirtualScrollRef2"
        class="font-mono break-all text-sm"
        :class="[store.enableLineWrap ? 'break-all' : 'text-nowrap']"
    >
      <template v-slot:default="{ item, }">
        <div>
          <div class="flex" :class="[store.enableLineWrap ? 'whitespace-pre-wrap' : 'whitespace-pre']">
            <p class="text-nowrap text-sm text-lime-500" v-if="item.isRX" type="success" v-show="store.showTimestamp">
              <span>{{ item.time }}</span>◄-RX|</p>
            <p class="text-nowrap text-sm text-sky-500" v-else-if="item.type === 0" type="primary" v-show="store.showTimestamp">
              <span>{{ item.time }}</span>TX-►|</p>
            <p class="text-nowrap text-sm text-amber-800" v-else type="primary" v-show="store.showTimestamp">
                <span>{{ item.time }}</span>NS-►|</p>
            <p v-show="store.showText"
               v-html="item.str"></p>
          </div>
          <div class="flex">
            <p v-show="store.showHex" class="">{{ item.hex }}</p>
          </div>
          <div class="flex whitespace-pre">
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

  <div class="shrink-0 flex h-8 mt-0.5 text-xs">
    <div class="flex shrink-0">
      <el-tooltip :content="translate('uart.tempDisplayTooltip')" effect="light">
        <InlineSvg name="help" class="w-3.5 h-3.5 text-gray-500 cursor-help"></InlineSvg>
      </el-tooltip>
      <p>►</p>
    </div>
    <div ref="RxHexDumpRef" class="p-0.5 border-2 rounded w-full overflow-y-scroll font-mono text-nowrap">
      <p v-html="store.RxRemainHexdump"></p>
    </div>
  </div>

  <div class="shrink-0 min-h-6 flex gap-2 justify-between overflow-auto">
    <div class="flex gap-2">
      <el-link @click="clearSendInput">
        <el-tag class="font-mono" size="small">
          <div class="flex ">
            <InlineSvg class="h-5" name="trash"></InlineSvg>
            <span class="content-end text-xs">⇩</span>
          </div>
        </el-tag>
      </el-link>

      <el-tooltip :content="translate('uart.loopSendTooltip')" placement="right" effect="light" :show-after="1000">
        <div class="flex align-center">
          <el-checkbox v-model="store.enableLoopSend" class="font-mono font-bold max-h-5" size="small" border>
            {{ translate('uart.loopSend') }}(ms)
          </el-checkbox>
          <el-input-number
              v-model="store.loopSendFreq"
              class="h-5"
              size="small"
              :step="10"
              :min="1"
          >
          </el-input-number>
        </div>
      </el-tooltip>

      <el-link @click="store.isSendTextFormat = !store.isSendTextFormat">
        <el-tag class="font-mono font-bold" size="small">{{ translate('uart.sendFormat') }}：{{ store.isSendTextFormat ? translate("uart.text") : "HEX" }}</el-tag>
      </el-link>
    </div>
    <div class="flex gap-2">
      <el-link @click="store.clearTxCounter()">
        <el-tag class="font-mono font-bold" size="small">
          {{ `TX(B):${store.TxByteCount}/ ${store.TxTotalByteCount}` }}
        </el-tag>
      </el-link>
      <el-link type="success" @click="store.clearRxCounter()">
        <el-tag class="font-mono font-bold" size="small" type="success">
          {{ `RX(B):${store.RxByteCount}/ ${store.RxTotalByteCount}` }}
        </el-tag>
      </el-link>
      <div class="flex align-center">
        <el-tag class="font-mono font-bold" size="small" type="info">
          <el-link class="flex" @click="store.clearDataBuff" type="warning">
            <InlineSvg class="h-5" name="trash"></InlineSvg>
          </el-link>
          <span class="align-text-bottom">{{ translate('uart.cachedFrame') }}: {{ store.dataBufLength }}/30000</span>
        </el-tag>
      </div>
    </div>
  </div>
  <div class="flex flex-row font-mono">
    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6}" v-model="store.uartInputTextBox" clearable
              :placeholder="store.isSendTextFormat ?
              translate('uart.textAndEscape') :
              'HEX'"
              @keydown="handleTextboxKeydown"
    ></el-input>
    <el-tooltip content="Ctrl+Enter" placement="top" :auto-close="500">
      <el-button type="primary"
                 @click="onSendClick">
        {{ (store.isSendTextFormat || store.isHexStringValid) ? translate("uart.send") : translate("格式化") }}
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {useDataViewerStore} from "@/stores/dataViewerStore";
import InlineSvg from "@/components/InlineSvg.vue";
import TextDataConfig from "@/views/text-data-viewer/textDataConfig.vue";
import {debouncedWatch} from "@vueuse/core";
import {globalNotify} from "@/composables/notification";
import {translate} from "@/locales";
import type { DraggableComponent } from '@/types/grid'

defineOptions({
  name: 'TextDataViewer',
  widgetIconName: 'text-data'
})

withDefaults(defineProps<{
  editCell?: boolean
  showDataConfig?: boolean
}>(), {
  editCell: false,
  showDataConfig: true,
})

const modelValue = defineModel<DraggableComponent>({ required: false })


const count = ref(0);
const vuetifyVirtualScrollBarRef = ref(document.body);
const vuetifyVirtualScrollContainerRef = ref(document.body);

const store = useDataViewerStore();

const RxHexDumpRef = ref(document.body);

let lastScrollHeight = 0;

const mutationObserver = new MutationObserver(() => {
  if (store.forceToBottom) {
    lastScrollHeight = vuetifyVirtualScrollBarRef.value.scrollTop;
    scrollToBottom();
  }
});

function attachScroll() {
  const parent = document.getElementById('myScrollerID') || document.body;

  // used to scroll to bottom
  vuetifyVirtualScrollBarRef.value = parent || document.body;

  // used to monitor height changes, so that one new Items are rendered, the height change -> scroll to bottom
  vuetifyVirtualScrollContainerRef.value = parent.querySelector('.v-virtual-scroll__container') || document.body;

  vuetifyVirtualScrollBarRef.value.onscroll = handleScroll;

  if (vuetifyVirtualScrollContainerRef.value) {
    const config = {childList: true, subtree: true, attributes: true};
    mutationObserver.observe(vuetifyVirtualScrollBarRef.value, config)
  }

  if (store.forceToBottom) {
    scrollToBottom();
  }
}

onMounted(() => {
  attachScroll();
})

onUnmounted(() => {
  mutationObserver.disconnect();
  if (!store.isHexStringValid) {
    store.uartInputTextBox = formatHexInput(store.uartInputTextBox);
  }
});

debouncedWatch(() => store.showVirtualScroll, () => {
  lastScrollHeight = 0;
  mutationObserver.disconnect();
  attachScroll();
}, {debounce: 80});


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
    store.addItem(arr, false, false, 1);
  }
}

function scrollToBottom() {
  nextTick(() => {
    const scrollerElement = vuetifyVirtualScrollBarRef.value; // Adjust according to your setup
    scrollerElement.scrollTop = scrollerElement.scrollHeight;
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
  let output: string[] = [];

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
  store.isHexStringValid = store.uartInputTextBox.toUpperCase() === formatHexInput(store.uartInputTextBox);
  if (!store.isHexStringValid) {
    store.enableLoopSend = false;
  }
}

watch(() => store.isSendTextFormat, (value) => {
  if (!value) {
    checkHexTextValid()
  }
});

watch(() => store.uartInputTextBox, () => {
  if (!store.isSendTextFormat) {
    checkHexTextValid()
  }
})

/* patch scroll container does not update clear filter */
watch(() => store.filterChanged, (value) => {
  if (value && store.forceToBottom) {
    scrollToBottom();
  }
  store.filterChanged = false;
})

watch(() => store.RxRemainHexdump, value => {
  if (value) {
    RxHexDumpRef.value.scrollTop = RxHexDumpRef.value.scrollHeight;
  }
})

watch(() => store.showVirtualScroll, () => {
  if (store.forceToBottom) {
    scrollToBottom();
  }
});

const handleScroll = () => {
  if (store.forceToBottom) {
    if (vuetifyVirtualScrollBarRef.value.scrollTop - lastScrollHeight < 0) {
      store.forceToBottom = false;
    } else {
      scrollToBottom();
    }
  } else if ((vuetifyVirtualScrollBarRef.value.scrollHeight -
      vuetifyVirtualScrollBarRef.value.scrollTop) <= vuetifyVirtualScrollBarRef.value.clientHeight) {
      store.forceToBottom = true;
  }
  lastScrollHeight = vuetifyVirtualScrollBarRef.value.scrollTop;
};

watch(() => store.forceToBottom, value => {
  if (value) {
    setTimeout(scrollToBottom, 0);
  }
});

function clearSendInput() {
  store.uartInputTextBox = ""
}

function handleTextboxKeydown(ev: KeyboardEvent) {
  if (ev.ctrlKey && ev.key === 'Enter') {
    onSendClick();
  }
}

function onSendClick() {
  if (!store.uartInputTextBox && !store.hasAddedText) {
    globalNotify("无帧头帧尾、发送框无数据发送")
    return;
  }

  if (store.acceptIncomingData) {
    if (store.isSendTextFormat) {
      store.addString(store.uartInputTextBox, false, true);
    } else if (!store.isHexStringValid) {
      store.uartInputTextBox = formatHexInput(store.uartInputTextBox);
    } else {
      store.addHexString(store.uartInputTextBox, false, true);
    }
  } else {
    if (store.isSendTextFormat) {
      store.addString(store.uartInputTextBox, false, true, 1);
    } else if (!store.isHexStringValid) {
      store.uartInputTextBox = formatHexInput(store.uartInputTextBox);
    } else {
      store.addHexString(store.uartInputTextBox, false, true, 1);
    }
  }
}

</script>
