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
            <InlineSvg name="repeat" width="20"></InlineSvg>
            <div v-if="config.editGrid">
              <el-input v-model="item.title" size="small" placeholder="Grid Item Title" />
            </div>
            <div
              v-else-if="item.title"
              class="mb-1 p-1 bg-blue-400 text-white rounded truncate"
              :title="item.title"
            >
              {{ item.title }}
            </div>
            <p v-else></p>
            <!-- empty space to align the check tag -->
            <el-check-tag
              v-if="config.editGrid"
              :checked="item.static"
              type="danger"
              class="self-center px-1"
              @click="item.static = !item.static"
            >
              <InlineSvg v-show="item.static" name="lock" width="20"></InlineSvg>
              <InlineSvg v-show="!item.static" name="lock_open" width="20"></InlineSvg>
            </el-check-tag>
          </div>

          <div class="bg-amber-500 overflow-y-auto min-h-0 flex-1 flex-col">
            <component
              :is="item.widget"
              v-model="rows[item.i]"
              :edit-grid-cell="config.editGridCell"
              class="bg-amber-500 flex-1 overflow-hidden min-h-0"
            />
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
import WidgetLoop from './widgets/widgetLoop.vue'
import type { DraggableComponent, UartCommandData } from '../types/grid'

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
  {
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    i: 0,
    title: 'Widget A',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[0] })
  },
  {
    x: 4,
    y: 0,
    w: 4,
    h: 3,
    i: 1,
    title: 'Widget B',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[1] })
  },
  {
    x: 8,
    y: 0,
    w: 4,
    h: 2,
    i: 2,
    title: 'Widget C',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[2] })
  }
])

const rows = ref<Record<number, DraggableComponent<UartCommandData>[]>>({
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

function rawClone(item: DraggableComponent<UartCommandData>): DraggableComponent<UartCommandData> {
  // remove Vue's proxy wrapper
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
