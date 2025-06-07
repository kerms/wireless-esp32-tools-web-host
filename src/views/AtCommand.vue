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
          <div class="flex justify-between pb-0.5">
            <el-button text bg size="small" @click="runCommands(item.i)">
              <InlineSvg :name="item.widget.widgetIconName" width="20"></InlineSvg>
            </el-button>
            <div v-if="config.editGrid">
              <el-input v-model="item.title" size="small" placeholder="Grid Item Title" />
            </div>
            <div
              v-else-if="item.title"
              class="truncate font-bold self-center text-sm"
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

          <div class="bg-gray-200 overflow-y-auto flex flex-col flex-grow">
            <component
              :is="item.widget"
              v-model="rows[item.i]"
              :edit-grid-cell="config.editGridCell"
            />
          </div>
        </grid-item>
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, ref, watch, toRaw, onMounted } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { VueDraggable } from 'vue-draggable-plus'
import { ElInput, ElCheckbox, ElCheckTag, ElButton } from 'element-plus'
import UartAtCommand from './widgets/uartAtCommand.vue'
import WidgetLoop from './widgets/widgetLoop.vue'
import type { DraggableComponent, UartCommandData } from '../types/grid'
import { useSequentialUart } from '@/composables/useSequentialUart'
import { isDevMode } from '@/composables/buildMode'
import textDataViewer from '@/views/text-data-viewer/textDataViewer.vue'
import { useUartModule } from '@/composables/useUartModule'

const { sendCommands } = useSequentialUart()

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

onMounted(() => {
  useUartModule()
})

const layout = ref([
  {
    x: 0,
    y: 0,
    w: 10,
    h: 10,
    i: 0,
    title: 'Widget A',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[0] })
  },
  {
    x: 10,
    y: 0,
    w: 10,
    h: 10,
    i: 1,
    title: 'Widget B',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[1] })
  },
  {
    x: 0,
    y: 10,
    w: 10,
    h: 10,
    i: 2,
    title: 'Widget C',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: () => ({ rows: rows.value[2] })
  },
  {
    x: 10,
    y: 10,
    w: 10,
    h: 10,
    i: 3,
    title: 'Widget D',
    static: false,
    widget: markRaw(textDataViewer),
    widgetProps: () => ({ })
  }
])

const rows = ref<Record<number, DraggableComponent<any>[]>>({
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

const handleAddItem = (gridIndex: number) => {
  const newId =
    Math.max(
      0,
      ...Object.values(rows.value)
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
  rows.value[gridIndex].push(newItem)
}

const runCommands = async (gridIndex: number) => {
  const commandsToRun = rows.value[gridIndex]
  if (!commandsToRun) return

  for (const command of commandsToRun) {
    if (isDevMode()) {
      console.log('runCommands', command.props.command)
    }
    const response = await sendCommands([command.props.command])
    command.props.response = response[0] || 'No response'
  }
}

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
