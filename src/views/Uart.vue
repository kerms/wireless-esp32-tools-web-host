<template>
  <div class="button-m-0 messages-container flex flex-grow overflow-hidden" :class="{'flex-col': layoutMode==='col'}">
    <div v-show="store.configPanelShow" ref="win1Ref" class="bg-gray-50 flex-shrink-0 overflow-auto"
         :class="{
      'max-w-60': layoutMode==='row', 'xl:max-w-80': layoutMode==='row',
      'min-w-60': layoutMode==='row', 'xl:min-w-80': layoutMode==='row'
    }"
    >
      <text-data-config></text-data-config>
    </div>

    <div v-show="store.configPanelShow && (winDataView.show || win2.show)" ref="firstWinResizeRef"></div>

    <div v-show="winDataView.show" class="flex flex-col flex-grow overflow-hidden p-2">
      <textDataViewer></textDataViewer>
    </div>

    <div v-show="winDataView.show && win2.show" ref="thirdWinResizeRef"></div>

    <div v-show="win2.show" ref="win2Ref" :class="{
      'max-w-80': layoutMode==='row', 'xl:max-w-96': layoutMode==='row',
      'min-w-80': layoutMode==='row', 'xl:min-w-96': layoutMode==='row'
    }"
         class="bg-gray-50 flex flex-col flex-shrink-0 min-h-32 overflow-auto p-2">


      <div class="flex flex-col gap-5">
        <el-text type="primary">快捷发送</el-text>
        <el-text size="small">努力施工中</el-text>

      </div>
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
            <el-segmented v-model="layoutMode" :options="layoutOptions" size="small"/>
          </div>
          <el-checkbox label="自适应" v-model="layoutConf.isAutoHide" border size="small"
                       :disabled="layoutMode==='col'"/>
          <el-checkbox label="设置窗" v-model="store.configPanelShow" border size="small" :disabled="layoutConf.isAutoHide"/>
          <el-checkbox label="数据窗" v-model="winDataView.show" border size="small" :disabled="layoutConf.isAutoHide"/>
          <el-checkbox label="快捷窗" v-model="win2.show" border size="small" :disabled="layoutConf.isAutoHide"/>
        </div>

        <template #reference>
          <el-button class="min-h-full" type="primary" :size="layoutConf.isMedium ? 'small' : 'default'">布局
          </el-button>
        </template>
      </el-popover>
    </div>
    <div class="mx-1"></div>
  </teleport>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, reactive, type Ref, ref, type UnwrapRef, watch} from "vue";
import {breakpointsTailwind, useBreakpoints, useWindowSize} from '@vueuse/core'
import {useDataViewerStore} from '@/stores/dataViewerStore';
import * as api from '@/api';
import * as uart from '@/api/apiUart';
import * as bin from '@/api/binDataDef';
import * as data_flow from '@/api/apiDataFlow';
import textDataViewer from "@/views/text-data-viewer/textDataViewer.vue";
import textDataConfig from "@/views/text-data-viewer/textDataConfig.vue"
import {registerModule} from "@/router/msgRouter";
import {type ApiBinaryMsg} from "@/api/binDataDef";
import {
  type IUartMsgBaud,
  type IUartMsgConfig,
  uart_get_baud,
  uart_get_config,
  uart_set_baud,
  uart_set_config,
  WtUartCmd
} from "@/api/apiUart";
import {isDevMode} from "@/composables/buildMode";
import {ControlEvent} from "@/api";
import {wt_data_flow_attach_cur_to_sender} from "@/api/apiDataFlow";

const store = useDataViewerStore()

const firstWinResizeRef = ref(document.body);
const thirdWinResizeRef = ref(document.body);
const win1Ref = ref(document.body);
const win2Ref = ref(document.body);

const breakpoints = useBreakpoints(breakpointsTailwind)
const windowSize = useWindowSize()

const layoutConf = reactive({
  isSmall: breakpoints.smaller("sm"),
  isMedium: breakpoints.smaller("lg"),
  isAutoHide: ref(true)
});

const layoutOptions = [{
  label: '横/行',
  value: 'row'
}, {
  label: '竖/列',
  value: 'col'
}]

const layoutMode = ref(layoutOptions[0].value);

const displayOptions = [{
  label: '默认显示',
  value: 'auto'
}, {
  label: '手动显示',
  value: 'manual'
}]
const displayMode = ref(displayOptions[0].value);

interface WinProperty {
  show: boolean;
  width: string;
  height: string;
  borderSize: number;
}

const win1 = reactive<WinProperty>({
  show: true,
  width: "100px",
  height: "100px",
  borderSize: 3,
});

const win2 = reactive<WinProperty>({
  show: true,
  width: "100px",
  height: "100px",
  borderSize: 3,
});

const winDataView = reactive({
  show: true,
})

const ctx = reactive({
  curResizeTarget: "none",
  curHeightOffset: 0,
});

function updateCursor(i: HTMLElement) {
  if (layoutMode.value === 'row') {
    i.style.cursor = "col-resize";
  } else {
    i.style.cursor = "row-resize";
  }
}

function updateWin(r: Ref<HTMLElement>, p: UnwrapRef<WinProperty>) {
  if (layoutMode.value === 'row') {
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
  updateWin(win1Ref, win1);
  updateWin(win2Ref, win2);
}

function mouseResize(e: MouseEvent) {
  const curTarget = e.target as HTMLElement

  if (layoutMode.value === 'row') {
    let f = e.clientX;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minWidth = f + "px";
      win1Ref.value.style.maxWidth = f + "px";
    } else {

      console.log("Row clientX", e.clientX, "clientY", e.clientY,
          "layerX", e.layerX, "layerY", e.layerY, "offsetX", e.offsetX, "offsetY", e.offsetY,
          "pageX", e.pageX, "pageY", e.pageY, win2Ref.value.clientHeight);
      win2Ref.value.style.minWidth = document.body.scrollWidth - f - win2.borderSize + "px";
      win2Ref.value.style.maxWidth = document.body.scrollWidth - f - win2.borderSize + "px";
    }
  } else {
    /* col mode */
    let f = e.clientY;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minHeight = f - ctx.curHeightOffset + "px";
      win1Ref.value.style.maxHeight = f - ctx.curHeightOffset + "px";
    } else {
      console.log("Col clientX", e.clientX, "clientY", e.clientY,
          "layerX", e.layerX, "layerY", e.layerY, "offsetX", e.offsetX, "offsetY", e.offsetY,
          "pageX", e.pageX, "pageY", e.pageY, curTarget.offsetWidth, ctx.curHeightOffset);
      win2Ref.value.style.minHeight = ctx.curHeightOffset - f + "px";
      win2Ref.value.style.maxHeight = ctx.curHeightOffset - f + "px";
    }
  }
}

function touchResize(e: TouchEvent) {
  let t = e.touches[0];
  let f = 0;

  if (layoutMode.value === 'row') {
    f = t.clientX;
    if (ctx.curResizeTarget === "first") {
      win1Ref.value.style.minWidth = f + "px";
      win1Ref.value.style.maxWidth = f + "px";
    } else {
      win2Ref.value.style.minWidth = document.body.scrollWidth - f - win2.borderSize + "px";
      win2Ref.value.style.maxWidth = document.body.scrollWidth - f - win2.borderSize + "px";
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
      win2Ref.value.style.minHeight = document.body.scrollHeight - f - win2.borderSize + "px";
      win2Ref.value.style.maxHeight = document.body.scrollHeight - f - win2.borderSize + "px";
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
  layoutConf.isAutoHide = false;
}

function stopResize() {
  if (win1Ref.value) {
    win1Ref.value.style.transition = '';
    if (layoutMode.value === "row") {
      win1.width = win1Ref.value.style.minWidth;
    } else {
      win1.height = win1Ref.value.style.minHeight;
    }
  }
  if (win2Ref.value) {
    win2Ref.value.style.transition = '';
    if (layoutMode.value === "row") {
      win2.width = win1Ref.value.style.minWidth;
    } else {
      win2.height = win1Ref.value.style.minHeight;
    }
  }
  document.body.style.cursor = '';
  document.removeEventListener("mousemove", mouseResize, false);
  document.removeEventListener("touchmove", touchResize, false);
}

watch(() => layoutMode.value, (value) => {
  updateResizer();
  if (value === "col") {
    layoutConf.isAutoHide = false;
  }
});

watch([
  () => layoutConf.isSmall,
  () => layoutConf.isAutoHide
], (value) => {
  if (layoutConf.isAutoHide) {
    win2.show = !value[0];
    win1Ref.value.style.minWidth = "";
    win1Ref.value.style.maxWidth = "";
  }
}, {
  immediate: true,
});

watch([
  () => layoutConf.isMedium,
  () => layoutConf.isAutoHide
], (value) => {
  if (layoutConf.isAutoHide) {
    store.configPanelShow = !value[0];
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

watch(() => win2.show, value => {
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

  if (msg.sub_mod !== 1) {
    /* ignore other num for the moment */
    return;
  }

  /* UART_NUM_1 msg */
  store.addItem(new Uint8Array(msg.payload), true);
};

const onDataFlowJsonMsg = (msg: api.ApiJsonMsg) => {
  if (isDevMode()) {
    console.log("Dflow Json", msg);
  }
};

const onDataFlowBinaryMsg = (msg: ApiBinaryMsg) => {
  if (isDevMode()) {
    console.log("Dflow Bin", msg);
  }
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
  wt_data_flow_attach_cur_to_sender(0);
  uart_get_baud();
  uart_get_config();
}

watch(() => store.uartBaud, value => {
  uart_set_baud(value);
});

watch(() => store.uartConfig, value => {
  uart_set_config(value);
}, {deep: true});

onMounted(() => {
  registerModule(api.WtModuleID.UART, {
    ctrlCallback: onClientCtrl,
    serverJsonMsgCallback: onUartJsonMsg,
    serverBinMsgCallback: onUartBinaryMsg,
  });

  registerModule(api.WtModuleID.DATA_FLOW, {
    ctrlCallback: () => {},
    serverJsonMsgCallback: onDataFlowJsonMsg,
    serverBinMsgCallback: onDataFlowBinaryMsg,
  });

  firstWinResizeRef.value.style.borderWidth = win1.borderSize + "px";
  thirdWinResizeRef.value.style.borderWidth = win2.borderSize + "px";
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
