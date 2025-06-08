<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { DraggableComponent, WidgetItem } from '../../types/grid'
import { ElButton, ElIcon } from 'element-plus'
import { markRaw, ref, watch, onMounted, onUnmounted } from 'vue'
import { debouncedWatch } from '@vueuse/core'
import type { UartCommandData } from '@/types/grid'
import UartAtCommand from '@/views/widgets/uartAtCommand.vue'
import { useWsStore } from '@/stores/websocket'
import { globalNotify } from '@/composables/notification'
import { isDevMode } from '@/composables/buildMode'
import { useSequentialUart } from '@/composables/useSequentialUart'
import { useCommandLoopManager } from '@/composables/useCommandLoopManager'

/* ---------------- props & model ----------------------------------- */
const modelValue = defineModel<WidgetItem>({ required: true })
defineProps<{
  editGridCell: boolean
}>()

defineOptions({
  name: 'WidgetLoop',
  widgetIconName: 'repeat'
})

const intervalMS = ref(0)
const active = ref(false)

// Get command loop manager
const commandLoopManager = useCommandLoopManager()
const { sendCommands } = useSequentialUart()
const widgetId = ref(`widget-${modelValue.value.i}`)

// This watcher handles enabling or disabling the recurring task.
watch(active, (isActive) => {
  if (isActive) {
    // When activated, register the loop if the interval is valid.
    const intervalValue = typeof intervalMS.value === 'string' ? parseInt(intervalMS.value, 10) : intervalMS.value;
    if (intervalValue > 0) {
      commandLoopManager.registerLoop(widgetId.value, intervalValue, runCommands);
    }
  } else {
    // When deactivated, always unregister the loop.
    commandLoopManager.unregisterLoop(widgetId.value);
  }
});

// This watcher handles changes to the interval, but only if the loop is active.
debouncedWatch(intervalMS, (newInterval) => {
  // If the loop isn't active, do nothing. The `active` watcher handles state.
  if (!active.value) {
    // If the interval is cleared while inactive, ensure it's unregistered.
    if (!newInterval || newInterval <= 0) {
        commandLoopManager.unregisterLoop(widgetId.value);
    }
    return;
  }
  
  const intervalValue = typeof newInterval === 'string' ? parseInt(newInterval, 10) : newInterval;
  
  // The registerLoop function internally handles unregistering the old task.
  // It will also handle unregistering if the new interval is invalid (e.g., 0).
  commandLoopManager.registerLoop(widgetId.value, intervalValue, runCommands);

}, { debounce: 500 });

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

const executeOnce = () => {
  // Register a one-time execution with the command loop manager
  // Set as highest priority by using a very small interval (1ms)
  commandLoopManager.registerLoop(
    `${widgetId.value}-once-${Date.now()}`, // Unique ID
    1, // 1ms interval (will be executed immediately)
    runCommands,
    true // oneTime = true
  )
}

const runCommands = async () => {
  if (useWsStore().state !== 'CONNECTED') {
    globalNotify('Device not connected', 'error');
    return
  }
  
  const commandsToRun = modelValue.value.widgetProps
  if (!commandsToRun || commandsToRun.length === 0) return

  // Extract command strings
  const commandStrings = commandsToRun.map(cmd => cmd.props.command)
  
  if (isDevMode()) {
    console.log('Running commands:', commandStrings)
  }
  
  // Execute all commands at once
  const responses = await sendCommands(commandStrings)
  
  // Update responses in UI
  commandsToRun.forEach((command, index) => {
    if (index < responses.length) {
      command.props.response = responses[index] || 'No response'
    }
  })
}

// Cleanup on unmount
onUnmounted(() => {
  commandLoopManager.unregisterLoop(widgetId.value)
})

// Initialize on mount
onMounted(() => {
  // On component mount, only register if it's explicitly set to active and has an interval.
  if (active.value && intervalMS.value > 0) {
    commandLoopManager.registerLoop(
      widgetId.value,
      intervalMS.value,
      runCommands
    )
  }
})
</script>

<template>
  <div class="flex flex-col h-full p-1">
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
    <div v-if="editGridCell" class="bg-gray-50 flex gap-1">
      <el-button type="primary" size="small" @click="handleAddItem"> Add Item </el-button>
      <div>
        <el-popover
          placement="top-start"
          trigger="hover"
          :show-after="1000"
          content="循环执行间隔"
        >
          <template #reference>
            <el-input
                v-model="intervalMS"
                :placeholder="'间隔'+'(ms)'"
                size="small"
                type="number"
                :min="0"
                :max="2147483647"
              >
                <template #prepend>
                  <InlineSvg name="repeat" width="20"></InlineSvg>
                </template>
              </el-input>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
  <teleport defer :to="`#tp-widget-before-${modelValue.i}`">
    <el-button plain size="small" @click="active = !active" :type="active ? 'success' : 'info'">
        {{ intervalMS }}ms
    </el-button>
  </teleport>
  <teleport defer :to="`#tp-widget-${modelValue.i}`">
    <el-button text bg size="small" @click="executeOnce">
      <InlineSvg name="play" width="20"></InlineSvg>
    </el-button>
  </teleport>
</template>
