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
    <el-tooltip
        effect="light"
        placement="top"
    >
      <template #content>
        <p>若存在多个页面，会相互覆盖</p>
      </template>
      <el-checkbox border v-model="store.autoSaveSettings">保存至本地</el-checkbox>
    </el-tooltip>
  </div>

  <div class="flex items-center mb-2 flex-wrap gap-2">
    <el-button type="primary" @click="() => {
    store.macroData.push({
      value: '',
      label: '发送',
      id: store.macroId,
    })
    store.macroId++;
  }">添加
    </el-button>
    <el-checkbox v-model="editMode" border>编辑</el-checkbox>
    <el-checkbox v-model="draggableEnabled" border>拖拽</el-checkbox>
  </div>
  <div>
    <el-alert v-if="store.ipChangeAlert" @close="store.ipChangeAlert=false">IP地址改变会导致配置丢失</el-alert>
  </div>

  <VueDraggable v-model="store.macroData" handle=".sort-target"
                :animation="150" class="break-input">
    <div v-for="(item, index) in store.macroData" :key="item.id" class="w-full text-xs flex items-center py-0.5"
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
      <el-link :underline="false" @click="store.macroData.splice(index, 1);">
        <el-tag size="large" type="danger" v-if="editMode" class="ml-1">
          x
        </el-tag>
      </el-link>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import {VueDraggable} from "vue-draggable-plus";
import {onMounted, ref} from "vue";
import {globalNotify, globalNotifyRightSide} from "@/composables/notification";
import {useDataViewerStore} from "@/stores/dataViewerStore";

const editMode = ref(false);
const draggableEnabled = ref(true);
const store = useDataViewerStore();
const emit = defineEmits(['winSizeRefresh'])

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
        store.loadSettings(text);
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

function exportSettings() {
  let obj = {
    version: "v0.1.0",

    /* Macro Window */
    ...store.settings
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

onMounted(() => {
  store.loadSettings();
});

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