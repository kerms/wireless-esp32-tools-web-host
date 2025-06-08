<template>
  <div class="">
  <div v-show="config.showOptions" class="flex h-40 overflow-y-auto">
    <div class="flex flex-col">
      <el-checkbox v-model="config.editGrid" border>Edit Grid</el-checkbox>
      <el-checkbox v-model="config.editGridCell" border>Edit Grid Cell</el-checkbox>
    </div>
    <div>
      <!-- <div
        class="droppable-element"
        draggable="true"
        unselectable="on"
        @drag="drag"
        @dragend="dragEnd"
      >
        Droppable Element (Drag me!)
      </div> -->
    </div>
  </div>
  <div class="h-screen flex flex-col w-full">
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
            <InlineSvg :name="item.widget.widgetIconName" width="20"></InlineSvg>
            <div :id="`tp-widget-before-${item.i}`"></div>
            <div v-if="config.editGrid" class="w-full">
              <el-input v-model="item.name" size="small" placeholder="Grid Item name" />
            </div>
            <div
              v-else-if="item.name"
              class="truncate font-bold self-center text-center text-sm w-full"
            >
              {{ item.name }}
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
              <div v-show="!config.editGrid" :id="`tp-widget-${item.i}`"></div>
          </div>

          <div class="bg-white overflow-y-auto flex flex-col flex-grow">
            <component
              :is="item.widget"
              v-model="layout[item.i]"
              :editGridCell="config.editGridCell"
            />
          </div>
        </grid-item>
      </GridLayout>
    </div>
  </div>
</div>
  <teleport to="#nav-right-slot">
    <ElCheckTag :checked="config.showOptions" type="primary" @click="config.showOptions = !config.showOptions">Edit Grid</ElCheckTag>
  </teleport>
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
import { useWsStore } from '@/stores/websocket'
import { globalNotify } from '@/composables/notification'

const { sendCommands } = useSequentialUart()

const config = ref({
  editGrid: true,
  editGridCell: false,
  showOptions: true,
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
    name: 'Widget A',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: [
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
  ]
  },
  {
    x: 10,
    y: 0,
    w: 10,
    h: 10,
    i: 1,
    name: 'Widget B',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: [
    {
      id: 1,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Scan WiFi',
        command: 'AT+WSCANasdfasdfasdf',
        response: 'SCAN OKasd fsdaf asdf asdf asdf asdf '
      }
    },
    {
      id: 2,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Connect WiFi',
        command: 'AT+WCONN=ssid,pwd',
        response: 'CONN OK'
      }
    }
  ]
  },
  {
    x: 0,
    y: 10,
    w: 10,
    h: 10,
    i: 2,
    name: 'Widget C',
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: [
    {
      id: 1,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Ping Test',
        command: 'AT+PING=google.com',
        response: 'PING OK'
      }
    }
  ]
  },
  {
    x: 10,
    y: 10,
    w: 10,
    h: 10,
    i: 3,
    name: 'Widget D',
    static: false,
    widget: markRaw(textDataViewer),
    widgetProps: []
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
      id: 1,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Scan WiFi',
        command: 'AT+WSCANasdfasdfasdf',
        response: 'SCAN OKasd fsdaf asdf asdf asdf asdf '
      }
    },
    {
      id: 2,
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
      id: 1,
      componentType: markRaw(UartAtCommand),
      props: {
        label: 'Ping Test',
        command: 'AT+PING=google.com',
        response: 'PING OK'
      }
    }
  ]
})

const runCommands = async (gridIndex: number) => {
  if (useWsStore().state !== 'CONNECTED') {
    globalNotify('Device not connected', 'error');
    return
  }
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
</script>

<style scoped>
:deep(.el-check-tag) {
  padding: 0;
}
</style>

