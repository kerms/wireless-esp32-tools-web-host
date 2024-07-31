<template>
  <div class="flex items-center mb-2 flex-wrap gap-2">
    <el-button type="primary" @click="importSettings">导入</el-button>
    <el-button type="warning" @click="exportSettings">导出</el-button>

    <el-tooltip
        effect="light"
        placement="top"
    >
      <template #content>
        <p>刷新页面后生效</p>
      </template>
      <el-button type="info" @click="resetSettings">重置</el-button>
    </el-tooltip>
  </div>

  <div class="flex items-center mb-2 flex-wrap gap-2">
    <el-button type="primary" @click="() => {
    macroData.push({
      value: '',
      label: '发送',
      id: macroId,
    })
    macroId++;
  }">添加
    </el-button>
    <el-checkbox v-model="editMode" border>编辑</el-checkbox>
    <el-checkbox v-model="draggableEnabled" border>拖拽</el-checkbox>
  </div>

  <el-alert>IP地址改变会导致配置丢失</el-alert>

  <VueDraggable v-model="macroData" handle=".sort-target"
                :animation="150" class="break-input">
    <div v-for="(item, index) in macroData" :key="item.id" class="w-full text-xs flex items-center py-0.5"
         :class="editMode ? 'macroButtons' : ''">
      <el-tag size="large" type="success" v-if="draggableEnabled" class="sort-target mr-1">
        =
      </el-tag>
      <el-input v-model="item.value" class="font-mono">
        <template #append>
          <el-input v-if="editMode" v-model="item.label"></el-input>
          <el-button v-else @click="onSendClick(item.value)" type="primary">{{ item.label }}</el-button>
        </template>
      </el-input>
      <el-link :underline="false" @click="macroData.splice(index, 1);">
        <el-tag size="large" type="danger" v-if="editMode" class="ml-1">
          x
        </el-tag>
      </el-link>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import {VueDraggable} from "vue-draggable-plus";
import {type Ref, ref} from "vue";
import {globalNotify, globalNotifyRightSide} from "@/composables/notification";
import {useDataViewerStore} from "@/stores/dataViewerStore";
import {useStorage} from '@vueuse/core';

const editMode = ref(false);
const draggableEnabled = ref(true);
const store = useDataViewerStore();
const emit = defineEmits(['winSizeRefresh'])

interface macroItem {
  value: string;
  label: string;
  id: number;
}

const macroDataDefault: Ref<macroItem[]> = ref([
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

const macroData = useStorage('macroItems', macroDataDefault);
let macroId = macroData.value.reduce((max, item) => Math.max(max, item.id), 0) + 1;

function onSendClick(val: string) {
  if (!val && !store.hasAddedText) {
    globalNotify("无帧头帧尾、发送框无数据发送")
    return;
  }

  if (store.acceptIncomingData) {
    store.addString(val, false, true);
  } else {
    store.addString(val, false, true, 1);
  }
}

interface DataViewerState {
  macroButtons: any; // Specify more precise types
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
}


function isKeyOfDataViewerState(key: any): key is keyof DataViewerState {
  return key in useDataViewerStore().$state;
}

function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const file = target.files[0];

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      try {
        const data = JSON.parse(text) as Partial<DataViewerState>;


        if (data.macroButtons) {
          macroData.value = data.macroButtons;
        }
        if (data.configTab) {
          viewerStore.configPanelTab = data.configTab;
        }
        if (data.showText) {
          viewerStore.showText = data.showText;
        }
        if (data.showHex) {
          viewerStore.showHex = data.showHex;
        }
        if (data.showHexdump) {
          viewerStore.showHexdump = data.showHexdump;
        }
        if (data.showTimestamp) {
          viewerStore.showTimestamp = data.showTimestamp;
        }
        if (data.lineWrap) {
          viewerStore.enableLineWrap = data.lineWrap;
        }
        if (data.RxHexdumpColor) {
          viewerStore.RxHexdumpColor = data.RxHexdumpColor;
        }
        if (data.TxHexdumpColor) {
          viewerStore.TxHexdumpColor = data.TxHexdumpColor;
        }
        if (data.frameBreakSequence) {
          viewerStore.frameBreakSequence = data.frameBreakSequence;
        }
        if (data.frameBreakAfterSequence) {
          viewerStore.frameBreakAfterSequence = data.frameBreakAfterSequence;
        }
        if (data.frameBreakDelay) {
          viewerStore.frameBreakDelay = data.frameBreakDelay;
        }
        if (data.frameBreakSize) {
          viewerStore.frameBreakSize = data.frameBreakSize;
        }

        if (data.frameBreak) {
          viewerStore.frameBreakRules = data.frameBreak;
        }
        if (data.decodeANSI) {
          viewerStore.enableAnsiDecode = data.decodeANSI;
        }
        if (data.frameFilterValue) {
          viewerStore.filterValue = data.frameFilterValue;
        }
        if (data.autoUpdate) {
          viewerStore.dataFilterAutoUpdate = data.autoUpdate;
        }
        if (data.updateInterval) {
          viewerStore.batchUpdateTime = data.updateInterval;
        }

        if (data.sendFramePrefix) {
          viewerStore.textPrefixValue = data.sendFramePrefix;
        }
        if (data.sendFrameSuffix) {
          viewerStore.textSuffixValue = data.sendFrameSuffix;
        }

        if (data.loopSendInterval) {
          viewerStore.loopSendFreq = data.loopSendInterval;
        }
        if (data.sendBoxIsText) {
          viewerStore.isSendTextFormat = data.sendBoxIsText;
        }
        if (data.sendBox) {
          viewerStore.uartInputTextBox = data.sendBox;
        }

        if (data.winLeft) {
          viewerStore.winLeft = data.winLeft;
        }
        if (data.winRight) {
          viewerStore.winRight = data.winRight;
        }
        if (data.winAutoLayout !== undefined) {
          viewerStore.winAutoLayout = data.winAutoLayout;
        }
        if (data.winLayoutMode) {
          viewerStore.winLayoutMode = data.winLayoutMode;
        }

        viewerStore.reloadFrameBreak();
        emit('winSizeRefresh', '');
      } catch (error) {
        globalNotifyRightSide('导入失败', "error");
        console.log("error", error);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

const viewerStore = useDataViewerStore();

function exportSettings() {
  let obj = {
    version: "v0.1.0",

    /* Macro Window */
    macroButtons: macroData.value,

    /* Config Window */
    configTab: viewerStore.configPanelTab,
    showText: viewerStore.showText,
    showHex: viewerStore.showHex,
    showHexdump: viewerStore.showHexdump,
    showTimestamp: viewerStore.showTimestamp,
    lineWrap: viewerStore.enableLineWrap,
    RxHexdumpColor: viewerStore.RxHexdumpColor,
    TxHexdumpColor: viewerStore.TxHexdumpColor,
    frameBreak: viewerStore.frameBreakRules,
    frameBreakSequence: viewerStore.frameBreakSequence,
    frameBreakAfterSequence: viewerStore.frameBreakAfterSequence,
    frameBreakDelay: viewerStore.frameBreakDelay,
    frameBreakSize: viewerStore.frameBreakSize,

    decodeANSI: viewerStore.enableAnsiDecode,
    frameFilterValue: viewerStore.filterValue,
    autoUpdate: viewerStore.dataFilterAutoUpdate,
    updateInterval: viewerStore.batchUpdateTime,

    sendFramePrefix: viewerStore.textPrefixValue,
    sendFrameSuffix: viewerStore.textSuffixValue,

    /* Viewer Window */
    loopSendInterval: viewerStore.loopSendFreq,
    sendBoxIsText: viewerStore.isSendTextFormat,
    sendBox: viewerStore.uartInputTextBox,

    /* layout settings */
    winLeft: viewerStore.winLeft,
    winRight: viewerStore.winRight,
    winAutoLayout: viewerStore.winAutoLayout,
    winLayoutMode: viewerStore.winLayoutMode,
  };

  const dataStr = JSON.stringify(obj, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "settingsBackup.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resetSettings() {
  localStorage.clear();
}

</script>


<style scoped>
.sortable-chosen {
  background-color: var(--el-color-primary-light-7);
}

.sort-target {
  cursor: move;
}

.macroButtons :deep(.el-input-group__append) {
  padding: 0;
}

.break-input :deep(.el-input-group__append) {
  background-color: unset;
  border-color: unset;
  color: unset;
}

.break-input :deep(.el-input-group__append button.el-button) {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-border-color);
  color: unset;
  border-radius: 0 5px 5px 0;
}

.break-input :deep(.el-input-group__append button.el-button):hover {
  background-color: var(--el-color-primary-light-7);
}
</style>