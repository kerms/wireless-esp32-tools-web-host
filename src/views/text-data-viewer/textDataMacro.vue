<template>
  <div class="flex items-center mb-2">
    <el-button class="mr-2" type="primary" @click="() => {
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