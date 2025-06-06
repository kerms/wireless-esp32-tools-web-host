<template>
  <div class="button-m-0 messages-container flex flex-grow overflow-hidden" :class="{'flex-col': store.winLayoutMode ==='col'}">
    <div v-show="store.winLeft.show" ref="win1Ref" class="bg-gray-50 flex-shrink-0 overflow-auto"
         :class="{
      'max-w-60': store.winLayoutMode==='row', 'xl:max-w-80': store.winLayoutMode==='row',
      'min-w-60': store.winLayoutMode==='row', 'xl:min-w-80': store.winLayoutMode==='row'
    }"
    >
      <text-data-config></text-data-config>
    </div>

    <div v-show="store.winLeft.show && (winDataView.show || store.winRight.show)" ref="firstWinResizeRef"></div>

    <div v-show="winDataView.show" class="flex flex-col flex-grow overflow-hidden p-2">
      <textDataViewer></textDataViewer>
    </div>

    <div v-show="winDataView.show && store.winRight.show" ref="thirdWinResizeRef"></div>

    <div v-show="store.winRight.show" ref="win2Ref" :class="{
      'max-w-80': store.winLayoutMode==='row', 'xl:max-w-96': store.winLayoutMode==='row',
      'min-w-80': store.winLayoutMode==='row', 'xl:min-w-96': store.winLayoutMode==='row'
    }"
         class="bg-gray-50 flex flex-col flex-shrink-0 min-h-32 overflow-auto p-2">
      <TextDataMacro @winSizeRefresh="handleWinSizeRefresh"></TextDataMacro>
    </div>
  </div>

  <teleport to="#page-spec-slot">
    <div>
      <el-popover
          placement="bottom"
          trigger="click"
          :hide-after="0"
          transition="none"
      >
        <div class="button-m-0 flex flex-col space-y-2">
          <div class="custom-style flex justify-center">
            <el-segmented v-model="store.winLayoutMode" :options="layoutOptions" size="small"/>
          </div>
          <el-checkbox v-model="store.winAutoLayout" border size="small"
                       :disabled="store.winLayoutMode==='col'">
            {{ $t('uart.responsive') }}
          </el-checkbox>
          <el-checkbox v-model="store.winLeft.show" border size="small" :disabled="store.winAutoLayout">
            {{ $t("uart.configPannel") }}
          </el-checkbox>
          <el-checkbox v-model="winDataView.show" border size="small" :disabled="store.winAutoLayout">
            {{ $t('uart.displayPannel') }}
          </el-checkbox>
          <el-checkbox v-model="store.winRight.show" border size="small" :disabled="store.winAutoLayout">
            {{ $t('uart.macroPannel') }}
          </el-checkbox>
        </div>

        <template #reference>
          <el-button class="min-h-full" type="primary" :size="layoutConf.isMedium ? 'small' : 'default'">
            {{ $t('uart.layout') }}
          </el-button>
        </template>
      </el-popover>
    </div>
    <div class="mx-1"></div>
  </teleport>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, type Ref, ref, type UnwrapRef, watch} from "vue";
import {breakpointsTailwind, useBreakpoints} from '@vueuse/core'
import {useDataViewerStore} from '@/stores/dataViewerStore';
import * as api from '@/api';
import {ControlEvent} from '@/api';
import {
  type IUartMsgBaud,
  type IUartMsgConfig,
  type IUartMsgNum,
  uart_get_baud,
  uart_get_config,
  uart_get_default_num,
  WtUartCmd
} from '@/api/apiUart';

/* TODO: use https://antoniandre.github.io/splitpanes/ */

import { type ApiBinaryMsg } from '@/api/binDataDef'
import * as df from '@/api/apiDataFlow'
import textDataViewer from '@/views/text-data-viewer/textDataViewer.vue'
import textDataConfig from '@/views/text-data-viewer/textDataConfig.vue'
import { registerModule } from '@/router/msgRouter'
import { isDevMode } from '@/composables/buildMode'
import { useWsStore } from '@/stores/websocket'
import { useUartStore } from '@/stores/useUartStore'
import TextDataMacro from '@/views/text-data-viewer/textDataMacro.vue'
import { translate } from '@/locales'
import { useUartModule } from '@/composables/useUartModule'


const store = useDataViewerStore()
const wsStore = useWsStore()
const uartStore = useUartStore()

const firstWinResizeRef = ref(document.body);
const thirdWinResizeRef = ref(document.body);
const win1Ref = ref(document.body);
const win2Ref = ref(document.body);

const breakpoints = useBreakpoints(breakpointsTailwind)

const layoutConf = reactive({
  isSmall: breakpoints.smaller("sm"),
  isMedium: breakpoints.smaller("lg"),
});

const layoutOptions = computed(() => [{
  label: translate("uart.landscape"),
  value: 'row'
}, {
  label: translate("uart.portrait"),
  value: 'col'
}]);

interface WinProperty {
  show: boolean;
  width: string;
  height: string;
  borderSize: number;
}


const winDataView = reactive({
  show: true,
})

const ctx = reactive({
  curResizeTarget: "none",
  curHeightOffset: 0,
});

function updateCursor(i: HTMLElement) {
  if (store.winLayoutMode === 'row') {
    i.style.cursor = "col-resize";
  } else {
    i.style.cursor = "row-resize";
  }
}

function updateWin(r: Ref<HTMLElement>, p: UnwrapRef<WinProperty>) {
  if (store.winLayoutMode === 'row') {
    r.value.style.minHeight = "";
    r.value.style.maxHeight = ""
    if (winDataView.show) {
      r.value.style.minWidth = p.width;
      r.value.style.maxWidth = p.width;
    }
  } else {
    r.value.style.minWidth = ""
    r.value.style.maxWidth = ""
    if (winDataView.show) {
      r.value.style.minHeight = p.height;
      r.value.style.maxHeight = p.height;
    }
  }
}

function updateCursors() {
  updateCursor(firstWinResizeRef.value);
  updateCursor(thirdWinResizeRef.value);
}

function updateResizer() {
  updateCursors();
  updateWin(win1Ref, store.winLeft);
  updateWin(win2Ref, store.winRight);
}

function mouseResize(e: MouseEvent) {
  const curTarget = e.target as HTMLElement

  if (store.winLayoutMode === 'row') {
    let f = e.clientX;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minWidth = f + "px";
      win1Ref.value.style.maxWidth = f + "px";
    } else {
      if (isDevMode()) {
        console.log("Row clientX", e.clientX, "clientY", e.clientY,
            "layerX", e.layerX, "layerY", e.layerY, "offsetX", e.offsetX, "offsetY", e.offsetY,
            "pageX", e.pageX, "pageY", e.pageY, win2Ref.value.clientHeight);
      }
      win2Ref.value.style.minWidth = document.body.scrollWidth - f - store.winRight.borderSize + "px";
      win2Ref.value.style.maxWidth = document.body.scrollWidth - f - store.winRight.borderSize + "px";
    }
  } else {
    /* col mode */
    let f = e.clientY;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minHeight = f - ctx.curHeightOffset + "px";
      win1Ref.value.style.maxHeight = f - ctx.curHeightOffset + "px";
    } else {
      if (isDevMode()) {
        console.log("Col clientX", e.clientX, "clientY", e.clientY,
            "layerX", e.layerX, "layerY", e.layerY, "offsetX", e.offsetX, "offsetY", e.offsetY,
            "pageX", e.pageX, "pageY", e.pageY, curTarget.offsetWidth, ctx.curHeightOffset);
      }
      win2Ref.value.style.minHeight = ctx.curHeightOffset - f + "px";
      win2Ref.value.style.maxHeight = ctx.curHeightOffset - f + "px";
    }
  }
}

function touchResize(e: TouchEvent) {
  let t = e.touches[0];
  let f: number;

  if (store.winLayoutMode === 'row') {
    f = t.clientX;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minWidth = f + "px";
      win1Ref.value.style.maxWidth = f + "px";
    } else {
      win2Ref.value.style.minWidth = document.body.scrollWidth - f - store.winRight.borderSize + "px";
      win2Ref.value.style.maxWidth = document.body.scrollWidth - f - store.winRight.borderSize + "px";
    }
  } else {
    /* column layout mode */
    f = t.clientY;
    if (ctx.curResizeTarget === "first") {
      /* setting window */
      win1Ref.value.style.minHeight = f - ctx.curHeightOffset + "px";
      win1Ref.value.style.maxHeight = f - ctx.curHeightOffset + "px";
    } else {
      /* quick access window */
      win2Ref.value.style.minHeight = document.body.scrollHeight - f - store.winRight.borderSize + "px";
      win2Ref.value.style.maxHeight = document.body.scrollHeight - f - store.winRight.borderSize + "px";
    }
  }
}

function startResize(event: Event) {
  // Normalize touch and mouse events
  if (event.type.includes('touch')) {
    ctx.curHeightOffset = (event as TouchEvent).touches[0].clientY;
  } else {
    ctx.curHeightOffset = (event as MouseEvent).clientY;
  }

  const divRef = event.target;

  if (divRef === firstWinResizeRef.value) {
    ctx.curResizeTarget = "first";
    ctx.curHeightOffset -= win1Ref.value.clientHeight;
    // ctx.curOffset = win1Ref.value.clientHeight;
  } else if (divRef === thirdWinResizeRef.value) {
    ctx.curResizeTarget = "third";
    ctx.curHeightOffset += win2Ref.value.clientHeight;
  }

  win1Ref.value.style.transition = 'initial';
  win2Ref.value.style.transition = 'initial';
  document.addEventListener("mousemove", mouseResize, false);
  document.addEventListener("touchmove", touchResize, false);
  store.winAutoLayout = false;
}

function stopResize() {
  if (win1Ref.value) {
    win1Ref.value.style.transition = '';
    if (store.winLayoutMode === "row") {
      store.winLeft.width = win1Ref.value.style.minWidth;
    } else {
      store.winLeft.height = win1Ref.value.style.minHeight;
    }
  }
  if (win2Ref.value) {
    win2Ref.value.style.transition = '';
    if (store.winLayoutMode === "row") {
      store.winRight.width = win2Ref.value.style.minWidth;
    } else {
      store.winRight.height = win2Ref.value.style.minHeight;
    }
  }
  document.body.style.cursor = '';
  document.removeEventListener("mousemove", mouseResize, false);
  document.removeEventListener("touchmove", touchResize, false);
}

watch(() => store.winLayoutMode, (value) => {
  updateResizer();
  if (value === "col") {
    store.winAutoLayout = false;
  }
});

watch([
  () => layoutConf.isSmall,
  () => store.winAutoLayout
], (value) => {
  if (store.winAutoLayout) {
    store.winRight.show = !value[0];
    win1Ref.value.style.minWidth = "";
    win1Ref.value.style.maxWidth = "";
  }
}, {
  immediate: true,
});

watch([
  () => layoutConf.isMedium,
  () => store.winAutoLayout
], (value) => {
  if (store.winAutoLayout) {
    store.winLeft.show = !value[0];
    win1Ref.value.style.minWidth = "";
    win1Ref.value.style.maxWidth = "";
    win2Ref.value.style.minWidth = "";
    win2Ref.value.style.maxWidth = "";
    winDataView.show = true;
  }
}, {
  immediate: true
});

watch(() => winDataView.show, value => {
  if (!value) {
    win1Ref.value.style.minWidth = "";
    win1Ref.value.style.maxWidth = "";
    win1Ref.value.style.maxHeight = "";
    win1Ref.value.style.maxHeight = "";

    win2Ref.value.style.minWidth = "";
    win2Ref.value.style.maxWidth = "";
    win2Ref.value.style.maxHeight = "";
    win2Ref.value.style.maxHeight = "";
  }
});

watch(() => store.winRight.show, value => {
  if (!value && !winDataView.show) {
    win1Ref.value.style.maxHeight = "";
    win1Ref.value.style.maxHeight = "";
    win1Ref.value.style.maxWidth = "";
    win1Ref.value.style.maxWidth = "";
  }
});

const onUartJsonMsg = (msg: api.ApiJsonMsg) => {
  switch (msg.cmd as WtUartCmd) {
    case WtUartCmd.GET_BAUD:
    case WtUartCmd.SET_BAUD:{
      const uartMsg = msg as IUartMsgBaud;
      if (uartMsg.baud) {
        store.setUartBaud(uartMsg.baud)
      }
      break;
    }
    case WtUartCmd.GET_CONFIG:
    case WtUartCmd.SET_CONFIG:{
      const uartMsg = msg as IUartMsgConfig;
      store.uartConfig.data_bits = uartMsg.data_bits;
      store.uartConfig.stop_bits = uartMsg.stop_bits;
      store.uartConfig.parity = uartMsg.parity;
      break;
    }
    case WtUartCmd.GET_DEFAULT_NUM:
      uartStore.uartNum = (msg as IUartMsgNum).num;
      uart_get_baud(uartStore.uartNum);
      uart_get_config(uartStore.uartNum);
      break;
    default:
      if (isDevMode()) {
        console.log("uart not treated", msg);
      }
      break
  }
};

const onUartBinaryMsg = (msg: ApiBinaryMsg) => {
  if (isDevMode()) {
    console.log("uart", msg);
  }

  store.addSegment(new Uint8Array(msg.payload), true);
};

const onClientCtrl = (msg: api.ControlMsg) => {
  if (msg.type !== api.ControlMsgType.WS_EVENT) {
    return
  }

  if (msg.data === ControlEvent.DISCONNECTED) {
    store.acceptIncomingData = false;
  } else if (msg.data === ControlEvent.CONNECTED) {
    updateUartData();
    store.acceptIncomingData = true;
  }
};

function updateUartData() {
  /* TODO: hard code for the moment, 0 is UART instance id (can be changed in the future) */
  uart_get_default_num();
  df.wt_data_flow_attach_cur_to_sender(0);
}

function handleWinSizeRefresh() {
  if (!store.winAutoLayout) {
    if (win1Ref.value) {
      if (store.winLayoutMode === "row") {
        win1Ref.value.style.minWidth = store.winLeft.width;
      } else {
        win1Ref.value.style.minHeight = store.winLeft.height;
        win1Ref.value.style.maxHeight = store.winRight.height;
      }
    }
    if (win2Ref.value) {
      if (store.winLayoutMode === "row") {
        win2Ref.value.style.minWidth = store.winRight.width;
      } else {
        win2Ref.value.style.minHeight = store.winRight.height;
        win2Ref.value.style.maxHeight = store.winRight.height;
      }
    }
  }
}

onMounted(() => {
  useUartModule()

  firstWinResizeRef.value.style.borderWidth = store.winLeft.borderSize + "px";
  thirdWinResizeRef.value.style.borderWidth = store.winRight.borderSize + "px";
  updateCursors()

  if (firstWinResizeRef.value) {
    firstWinResizeRef.value.addEventListener("mousedown", startResize, false);
    firstWinResizeRef.value.addEventListener("touchstart", startResize, false);
  }
  if (thirdWinResizeRef.value) {
    thirdWinResizeRef.value.addEventListener("mousedown", startResize, false);
    thirdWinResizeRef.value.addEventListener("touchstart", startResize, false);
  }

  document.addEventListener("mouseup", stopResize, false);
  document.addEventListener("touchend", stopResize, false);
  updateUartData();
  store.acceptIncomingData = wsStore.state === ControlEvent.CONNECTED;
  handleWinSizeRefresh()
});

onUnmounted(() => {
  if (firstWinResizeRef.value) {
    firstWinResizeRef.value.removeEventListener("mousedown", startResize, false);
    firstWinResizeRef.value.removeEventListener("touchstart", startResize, false);
  }

  if (thirdWinResizeRef.value) {
    thirdWinResizeRef.value.removeEventListener("mousedown", startResize, false);
    thirdWinResizeRef.value.removeEventListener("touchstart", startResize, false);
  }

  document.removeEventListener("mouseup", stopResize, false);
  document.removeEventListener("touchend", stopResize, false);
});

</script>

<style scoped>
.button-m-0 :deep(.el-button + .el-button) {
  margin-left: 0;
}

.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: var(--el-color-primary);
  --el-border-radius-base: 16px;
}

.button-m-0 :deep(.el-checkbox) {
  margin-right: 0;
}

</style>
