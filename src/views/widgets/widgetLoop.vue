<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { DraggableComponent } from '../../types/grid'
import { ElButton, ElIcon } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

/* ---------------- props & model ----------------------------------- */
const modelValue = defineModel<DraggableComponent[]>({ required: true })
defineProps<{
  editGridCell: boolean
}>()
const emit = defineEmits(['add-item'])

function deleteItem(id: number) {
  const index = modelValue.value.findIndex((item) => item.id === id)
  if (index !== -1) {
    modelValue.value.splice(index, 1)
  }
}

/* optional helper if you still need cloning */
function rawClone(item: DraggableComponent): DraggableComponent {
  return { ...item } // already plain in parent
}
</script>

<template>
  <div class="flex flex-col h-full">
    <VueDraggable
      v-model="modelValue"
      item-key="id"
      class="flex-1 min-h-0 overflow-y-auto"
      group="people"
      :clone="rawClone"
      :animation="100"
      direction="vertical"
      handle=".drag-handle"
    >
      <div v-for="row in modelValue" :key="row.id" class="flex items-center gap-1 p-1">
        <el-tag v-if="editGridCell" size="large" type="success" class="drag-handle cursor-move">
          =
        </el-tag>
        <component
          :is="row.componentType"
          v-model:modelValue="row.props"
          :is-editing-cell="editGridCell"
          class="flex-1"
        />
        <el-button
          v-if="editGridCell"
          type="danger"
          size="small"
          @click="deleteItem(row.id)"
          circle
        >
          <InlineSvg name="trash" width="20"></InlineSvg>
        </el-button>
      </div>
    </VueDraggable>
    <div v-if="editGridCell" class="bg-gray-200 p-0.5">
      <el-button type="primary" size="small" @click="emit('add-item')"> Add Item </el-button>
    </div>
  </div>
</template>
