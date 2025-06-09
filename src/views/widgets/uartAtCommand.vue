<template>
  <div ref="rootEl" class="p-1 bg-white text-xs border-b-2">
    <div v-if="props.editCell">
      <div>
        <div class="mb-1">
          <el-input v-model="model.label" placeholder="Label" size="small">
            <template #prepend>Label</template>
          </el-input>
        </div>
        <div class="mb-1">
          <el-input v-model="model.command" placeholder="UART Command" size="small">
            <template #prepend>Command</template>
          </el-input>
        </div>
      </div>
    </div>
    <div v-else-if="width < 250" class="">
      <div class="truncate flex justify-between">
        <el-text class="font-bold">{{ model.label }}</el-text>
        <p class="ml-1 font-mono text-gray-500 text-[10px]">{{ model.command }}</p>
      </div>
      <div>
        <strong>R:</strong>
        <el-text class="ml-1 font-mono">{{ model.response }}</el-text>
      </div>
    </div>
    <div v-else class="flex text-gray-700">
      <div class="truncate min-h-8 w-32">
          <p class="font-bold">{{ model.label }}</p>
          <p class="font-mono text-gray-500 text-[10px]">{{ model.command }}</p>
      </div>
      <div class="pt-0.5">
        <p class="font-mono text-sm">{{ model.response }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineModel, type PropType, ref } from 'vue'
import { ElInput, ElText } from 'element-plus'
import { useElementSize } from '@vueuse/core'

interface UartCommandData {
  command: string
  label: string
  response: string
  group?: string
}

const props = defineProps({
  editCell: {
    type: Boolean,
    default: false
  }
})

const model = defineModel<UartCommandData>({ required: true })

const rootEl = ref(null)
const { width } = useElementSize(rootEl)
</script>

<style scoped>
.el-input :deep(.el-input-group__prepend) {
  padding: 0 5px;
  font-size: 10px;
}
</style>
