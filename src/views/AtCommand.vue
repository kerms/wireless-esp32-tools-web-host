<template>
  <div class="h-screen flex flex-col">
    <div class="flex items-center gap-2 bg-gray-0 p-2">
      <el-checkbox v-model="config.editGrid" border>Edit Grid</el-checkbox>
      <el-checkbox v-model="config.editGridCell" border>Edit Grid Cell</el-checkbox>
    </div>
    <div class="flex-1 bg-gray-100 overflow-auto min-h-0">
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
          <div class="flex justify-between">
            <div v-if="config.editGridCell">
              <el-input v-model="item.title" size="small" placeholder="Grid Item Title" />
            </div>
            <div
              v-else-if="item.title"
              class="mb-1 p-1 bg-blue-400 text-white rounded truncate"
              :title="item.title"
            >
              {{ item.title }}
            </div>
            <el-check-tag
              v-if="config.editGrid"
              :checked="item.static"
              type="danger"
              class="self-center px-1"
              @click="item.static = !item.static"
            >
              <InlineSvg v-if="item.static" name="lock" width="20"></InlineSvg>
              <InlineSvg v-else name="lock_open" width="20"></InlineSvg>
            </el-check-tag>
          </div>

          <div class="bg-amber-500 overflow-y-auto min-h-0 flex-1 flex-col">
            <VueDraggable
              v-model="rows[item.i]"
              item-key="id"
              class="h-full flex flex-col"
              group="people"
              :clone="rawClone"
              :animation="100"
              direction="vertical"
              handle=".drag-handle"
              :disabled="config.editGrid"
            >
              <component
                v-for="element in rows[item.i]"
                :key="element.id"
                :is="element.componentType"
                v-model:modelValue="element.props"
                :is-editing-cell="config.editGridCell"
              />
            </VueDraggable>
          </div>
        </grid-item>
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, ref, watch, toRaw } from 'vue'
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
      props: { label: 'Device ID', command: 'AT+ID?', response: 'ID:xxxx' }
    },
    {
      id: 2,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Version', command: 'AT+VER?', response: 'V1.0.0' }
    },
    {
      id: 3,
      componentType: markRaw(UartAtCommand),
      props: { label: 'Reset', command: 'AT+RESET', response: 'OK' }
    }
  ],
  1: [
    {
      id: 4,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Scan WiFi',
        command: 'AT+WSCANasdfasdfasdf',
        response: 'SCAN OKasd fsdaf asdf asdf asdf asdf '
      }
    },
    {
      id: 5,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Connect WiFi',
        command: 'AT+WCONN=ssid,pwd',
        response: 'CONN OK'
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
        response: 'PING OK'
      }
    }
  ]
})

function rawClone(item: DraggableComponent): DraggableComponent {
  // remove Vue’s proxy wrapper
  const plain = toRaw(item)

  // return a shallow copy so each widget keeps its own identity
  return { ...plain }
}
</script>

<style scoped>
:deep(.el-check-tag) {
  padding: 0;
}
</style>
