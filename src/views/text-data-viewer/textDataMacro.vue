<template>
  <div class="flex items-center mb-2">
    <el-button class="mr-2" type="primary" @click="() => {
    macroData.push({
      input: '',
      btn_label: '发送',
      id: macroId,
    })
    macroId++;
  }">添加
    </el-button>
    <el-checkbox v-model="editMode" class="mr-2" border>编辑</el-checkbox>
    <el-checkbox v-model="draggableEnabled" class="mr-2" border>拖拽</el-checkbox>
  </div>

  <VueDraggable v-model="macroData" handle=".sort-target"
                :animation="150" class="break-input">
    <div v-for="(item, index) in macroData" :key="item.id" class="w-full text-xs flex items-center py-0.5"
         :class="editMode ? 'macroBtnList' : ''">
      <el-tag size="large" type="success" v-if="draggableEnabled" class="sort-target mr-1">
        =
      </el-tag>
      <el-input v-model="item.input" class="font-mono">
        <template #append>
          <el-input v-if="editMode" v-model="item.btn_label"></el-input>
          <el-button v-else @click="onSendClick(item.input)" type="primary">{{ item.btn_label }}</el-button>
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
import {globalNotify} from "@/composables/notification";
import {useDataViewerStore} from "@/stores/dataViewerStore";

const editMode = ref(false);
const draggableEnabled = ref(true);
const store = useDataViewerStore();

interface macroItem {
  input: string;
  btn_label: string;
  id: number;
}

let macroId = 3;

const macroData: Ref<macroItem[]> = ref([
  {
    input: 'AT',
    btn_label: '测试AT',
    id: 1,
  },{
    input: 'AT+CSQ',
    btn_label: '询信号强度',
    id: 2,
  },{
    input: 'AT+CGSN',
    btn_label: '询序列号',
    id: 3,
  }, {
    input: 'AT+CGMR',
    btn_label: '询固件版本',
    id: 4,
  }, {
    input: 'AT+CMEE',
    btn_label: '询终端报错',
    id: 5,
  }, {
    input: 'AT+NRB',
    btn_label: '重启',
    id: 6,
  }, {
    input: 'AT+CGATT',
    btn_label: '询网络激活状态',
    id: 7,
  }, {
    input: 'AT+CEREG',
    btn_label: '询网络注册状态',
    id: 8,
  }, {
    input: 'AT+CSCON',
    btn_label: '询网络连接状态',
    id: 9,
  }
]);


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

.macroBtnList :deep(.el-input-group__append) {
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