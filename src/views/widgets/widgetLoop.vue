<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { DraggableComponent, WidgetItem } from '../../types/grid'
import { ElButton, ElIcon } from 'element-plus'
import { markRaw } from 'vue'
import type { UartCommandData } from '@/types/grid'
import UartAtCommand from '@/views/widgets/uartAtCommand.vue'
import { useWsStore } from '@/stores/websocket'
import { globalNotify } from '@/composables/notification'
import { isDevMode } from '@/composables/buildMode'
import { useSequentialUart } from '@/composables/useSequentialUart'

/* ---------------- props & model ----------------------------------- */
const modelValue = defineModel<WidgetItem>({ required: true })
defineProps<{
  editGridCell: boolean
}>()

defineOptions({
  name: 'WidgetLoop',
  widgetIconName: 'repeat'
})

const handleAddItem = () => {
  const newId =
    Math.max(
      0,
      ...Object.values(modelValue.value)
        .flat()
        .map((item) => item.id)
    ) + 1
  const newItem: DraggableComponent<UartCommandData> = {
    id: newId,
    componentType: markRaw(UartAtCommand),
    props: {
      label: 'New Command',
      command: 'AT+CMD',
      response: ''
    }
  }
  modelValue.value.widgetProps.push(newItem)
}

function deleteItem(id: number) {
  const index = modelValue.value.widgetProps.findIndex((item) => item.id === id)
  if (index !== -1) {
    modelValue.value.widgetProps.splice(index, 1)
  }
}

/* optional helper if you still need cloning */
function rawClone(item: DraggableComponent): DraggableComponent {
  return { ...item } // already plain in parent
}

function ensureUniqueId(evt: any) {
  const arr = modelValue.value.widgetProps
  const moved = arr[evt.newIndex]       // item that just arrived
  const hasDuplicate = arr.filter(i => i.id === moved.id).length > 1
  if (hasDuplicate) {
    // e.g. give it the next free integer
    const max = Math.max(...arr.map(i => i.id))
    moved.id = max + 1
  }
}

const { sendCommands } = useSequentialUart()

const runCommands = async () => {
  if (useWsStore().state !== 'CONNECTED') {
    globalNotify('Device not connected', 'error');
    return
  }
  const commandsToRun = modelValue.value.widgetProps
  if (!commandsToRun) return

  for (const command of commandsToRun) {
    if (isDevMode()) {
      console.log('runCommands', command.props.command)
    }
    const response = await sendCommands([command.props.command])
    command.props.response = response[0] || 'No response'
  }
}

</script>

<template>
  <div class="flex flex-col h-full">
    <VueDraggable
      v-model="modelValue.widgetProps"
      item-key="id"
      class="flex-1 min-h-0 overflow-y-auto"
      group="people"
      :clone="rawClone"
      :animation="100"
      direction="vertical"
      handle=".drag-handle"
      @add="ensureUniqueId"
    >
      <div v-for="row in modelValue.widgetProps" :key="row.id" class="flex flex-row items-center">
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
      <el-button type="primary" size="small" @click="handleAddItem"> Add Item </el-button>
    </div>
  </div>
  <teleport defer :to="`#widget-slot-${modelValue.i}`" :disabled="editGridCell">
    <el-button text bg size="small" @click="runCommands">
      <InlineSvg name="play" width="20"></InlineSvg>
    </el-button>
  </teleport>
</template>
