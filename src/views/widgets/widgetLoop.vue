<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { DraggableComponent } from '../../types/grid'

/* ---------------- props & model ----------------------------------- */
const modelValue = defineModel<DraggableComponent[]>({ required: true })
defineProps<{
  editGridCell: boolean
}>()

/* optional helper if you still need cloning */
function rawClone(item: DraggableComponent): DraggableComponent {
  return { ...item } // already plain in parent
}
</script>

<template>
  <VueDraggable
    v-model="modelValue"
    item-key="id"
    class="h-full flex flex-col"
    group="people"
    :clone="rawClone"
    :animation="100"
    direction="vertical"
    handle=".drag-handle"
  >
    <component
      v-for="row in modelValue"
      :key="row.id"
      :is="row.componentType"
      v-model:modelValue="row.props"
      :is-editing-cell="editGridCell"
    />
  </VueDraggable>
</template>
