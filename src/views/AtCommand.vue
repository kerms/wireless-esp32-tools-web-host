<template>
  <div class="h-screen flex flex-col">
    <div class="flex items-center gap-2 bg-gray-0 p-2">
      <el-checkbox v-model="config.editGrid" border>Edit Grid</el-checkbox>
      <el-checkbox v-model="config.editGridCell" border>Edit Grid Cell</el-checkbox>
    </div>
    <div class="flex-1 bg-gray-200 overflow-auto min-h-0">
      <GridLayout
        v-model:layout="layout"
        :col-num="20"
        :row-height="30"
        :is-draggable="config.editGrid"
        :is-resizable="config.editGrid"
        :auto-size="false"
        :compact-type="null"
        :vertical-compact="false"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          v-bind="item"
          class="bg-blue-300 rounded-md flex flex-col text-xs p-1"
        >
          <div v-if="config.editGridCell" class="mb-1">
            <el-input v-model="item.title" size="small" placeholder="Grid Item Title" />
          </div>
          <div
            v-else-if="item.title"
            class="mb-1 p-1 bg-blue-400 text-white rounded truncate"
            :title="item.title"
          >
            {{ item.title }}
          </div>
          <div class="bg-amber-500 overflow-y-auto min-h-0 flex-1 p-1 space-y-1">
            <VueDraggable
              v-model="rows[item.i]"
              item-key="id"
              :animation="150"
              class="h-full"
              group="people"
            >
              <component
                v-for="element in rows[item.i]"
                :key="element.id"
                :is="element.componentType"
                v-model:modelValue="element.props"
                :is-editing-cell="config.editGridCell"
                class="cursor-move"
              />
            </VueDraggable>
          </div>
        </grid-item>
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, ref, watch } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { VueDraggable } from 'vue-draggable-plus'
import { ElInput, ElCheckbox } from 'element-plus'
import UartAtCommand from './widgets/uartAtCommand.vue'

interface UartCommandData {
  command: string
  label: string
  response: string
}

interface DraggableComponent {
  id: number
  componentType: any // Should be UartAtCommand
  props: UartCommandData
}

const config = ref({
  editGrid: true,
  editGridCell: false
})

watch(
  () => config.value.editGrid,
  (newValue) => {
    if (newValue) {
      config.value.editGridCell = false
    }
  }
)

watch(
  () => config.value.editGridCell,
  (newValue) => {
    if (newValue) {
      config.value.editGrid = false
    }
  }
)

const layout = ref([
  { x: 0, y: 0, w: 4, h: 2, i: 0, title: 'Widget A', static: false },
  { x: 4, y: 0, w: 4, h: 3, i: 1, title: 'Widget B', static: false },
  { x: 8, y: 0, w: 4, h: 2, i: 2, title: 'Widget C', static: false }
])

const rows = ref<Record<number, DraggableComponent[]>>({
  0: [
    {
      id: 1,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Device ID', command: 'AT+ID?', response: 'ID:xxxx', group: 'Device Info' }
    },
    {
      id: 2,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Version', command: 'AT+VER?', response: 'V1.0.0', group: 'Device Info' }
    },
    {
      id: 3,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Reset', command: 'AT+RESET', response: 'OK', group: 'Device Info' }
    }
  ],
  1: [
    {
      id: 4,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Scan WiFi', command: 'AT+WSCAN', response: 'SCAN OK', group: 'WiFi' }
    },
    {
      id: 5,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Connect WiFi',
        command: 'AT+WCONN=ssid,pwd',
        response: 'CONN OK',
        group: 'WiFi'
      }
    }
  ],
  2: [
    {
      id: 6,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Ping Test',
        command: 'AT+PING=google.com',
        response: 'PING OK',
        group: 'Network'
      }
    }
  ]
})

// The handleUpdate function is no longer needed here as v-model on the component handles it.
</script>

<style scoped>
/* tiny helper so the placeholder is visible while dragging */
.ghost {
  background: rgba(255, 193, 7, 0.35);
  border: 1px dashed #d97706;
}
</style>
