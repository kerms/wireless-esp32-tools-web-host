<template>
  <div class="p-1 border border-gray-300 rounded bg-white text-xs">
    <div v-if="isEditingCell" class="flex">
      <div>
        <div class="mb-1">
          <el-input v-model="model.label" placeholder="Label" size="small">
            <template #prepend>Label</template>
          </el-input>
        </div>
        <div class="mb-1">
          <el-input v-model="model.command" placeholder="AT Command" size="small">
            <template #prepend>Command</template>
          </el-input>
        </div>
      </div>
    </div>
    <div v-else class="">
      <div class="mb-px truncate flex justify-between" :title="model.label">
        <el-text class="font-bold">{{ model.label }}</el-text>
        <p class="ml-1 font-mono text-gray-500 text-[10px]">{{ model.command }}</p>
      </div>
      <div :title="model.response">
        <strong>R:</strong>
        <el-text class="ml-1">{{ model.response }}</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineModel, type PropType } from 'vue'
import { ElInput, ElText } from 'element-plus'

interface UartCommandData {
  command: string
  label: string
  response: string
  group?: string
}

const props = defineProps({
  isEditingCell: {
    type: Boolean,
    default: false
  }
})

const model = defineModel<UartCommandData>({ required: true })
</script>

<style scoped>
.el-input :deep(.el-input-group__prepend) {
  padding: 0 5px;
  font-size: 10px;
}
.el-text {
  font-size: 12px;
}
strong {
  font-weight: 500;
}
</style>
