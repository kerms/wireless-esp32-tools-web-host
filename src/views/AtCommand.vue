<template>
  <div class="flex flex-col h-screen">
    <div v-show="config.showOptions" class="flex h-40 overflow-y-auto">
      <div class="flex flex-col">
        <el-checkbox v-model="config.editGrid" border>Edit Grid</el-checkbox>
        <el-checkbox v-model="config.editGridCell" border>Edit Grid Cell</el-checkbox>
      </div>
      <div class="ml-4 flex gap-4">
        <div class="flex flex-col items-center">
          <div
            class="w-40 h-24 bg-gray-200 border-2 border-dashed rounded-md p-2 flex flex-col justify-center items-center text-center cursor-move"
            draggable="true"
            @dragstart="dragStart('loop', $event)"
            @drag="drag"
            @dragend="dragEnd"
          >
            <span class="font-bold">Loop Widget</span>
            <p class="text-xs">Container for command sequences.</p>
          </div>
          <el-button @click="addLoopWidget" size="small" class="w-full mt-1">Add to Grid</el-button>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="w-40 h-24 bg-gray-200 border-2 border-dashed rounded-md p-2 flex flex-col justify-center items-center text-center"
            :class="{
              'cursor-move': !isUartViewAdded,
              'cursor-not-allowed opacity-50': isUartViewAdded
            }"
            :draggable="!isUartViewAdded"
            @dragstart="dragStart('uart', $event)"
            @drag="drag"
            @dragend="dragEnd"
          >
            <span class="font-bold">Data Viewer</span>
            <p class="text-xs">Displays raw text data from UART.</p>
          </div>
          <el-button
            @click="addUartViewWidget"
            size="small"
            class="w-full mt-1"
            :disabled="isUartViewAdded"
            >Add to Grid</el-button
          >
        </div>
      </div>
    </div>
    <div ref="gridWrapper" class="flex-1 flex flex-col w-full min-h-0">
      <div class="flex-1 bg-gray-100 overflow-auto min-h-0">
        <GridLayout
          ref="gridlayout"
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
            v-for="(item, index) in layout"
            :key="item.i"
            v-bind="item"
            class="rounded-md flex flex-col text-xs p-1"
            :class="{
              'bg-blue-300': String(item.i) !== dropId,
              'bg-gray-400 opacity-50': String(item.i) === dropId
            }"
          >
            <template v-if="String(item.i) !== dropId">
              <div class="flex justify-between pb-0.5">
                <InlineSvg :name="item.widget.widgetIconName" width="20"></InlineSvg>
                <el-button v-show="config.editGrid" type="danger" size="small" class="self-center px-1" @click="deleteWidget(item.i)">
                  <InlineSvg name="close" width="20"></InlineSvg>
                </el-button>
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
                  v-model="layout[index]"
                  :editGridCell="config.editGridCell"
                />
              </div>
            </template>
            <div v-else class="flex justify-center items-center h-full">
              <p class="font-bold text-white">Drop here</p>
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
import { markRaw, ref, watch, toRaw, onMounted, onBeforeUnmount, computed } from 'vue'
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

const gridlayout = ref<InstanceType<typeof GridLayout> | null>(null)
const gridWrapper = ref<HTMLElement | null>(null)

const { sendCommands } = useSequentialUart()

const config = ref({
  editGrid: true,
  editGridCell: false,
  showOptions: true,
})

const isUartViewAdded = computed(() => layout.value.some((item) => item.widget === textDataViewer))

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

const throttle = (fn: Function, wait: number) => {
  let inThrottle: boolean, lastFn: number, lastTime: number
  return function (this: any, ...args: any[]) {
    const context = this
    if (!inThrottle) {
      fn.apply(context, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFn)
      lastFn = window.setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args)
          lastTime = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastTime), 0))
    }
  }
}

const mouseAt = { x: -1, y: -1 }
function syncMousePosition(event: MouseEvent) {
  mouseAt.x = event.clientX
  mouseAt.y = event.clientY
}

onMounted(() => {
  useUartModule()
  document.addEventListener('dragover', syncMousePosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('dragover', syncMousePosition)
})

const getNextId = (): number => {
  const numericIds = layout.value.map((item) => Number(item.i)).filter((id) => !isNaN(id))
  if (numericIds.length === 0) {
    return 0
  }
  return Math.max(...numericIds) + 1
}

const dropId = 'drop-placeholder'
const dragging = ref<{ type: string; w: number; h: number } | null>(null)

function dragStart(itemType: string, event: DragEvent) {
  if (itemType === 'loop') {
    dragging.value = { type: 'loop', w: 10, h: 5 }
  } else if (itemType === 'uart') {
    dragging.value = { type: 'uart', w: 10, h: 10 }
  }
  event.dataTransfer?.setData('text/plain', itemType)
}

const drag = throttle(() => {
  if (!dragging.value || !gridWrapper.value || !gridlayout.value) return

  const parentRect = gridWrapper.value.getBoundingClientRect()
  const mouseInGrid =
    mouseAt.x > parentRect.left &&
    mouseAt.x < parentRect.right &&
    mouseAt.y > parentRect.top &&
    mouseAt.y < parentRect.bottom

  const placeholderIndex = layout.value.findIndex((item) => String(item.i) === dropId)

  if (mouseInGrid) {
    const gLayout = gridlayout.value as any
    const colNum = 20
    const rowHeight = 30
    const margin = [10, 10]
    const scrollContainer = gLayout.$el.parentElement
    if (!scrollContainer) return
    const colWidth =
      (gLayout.$el.offsetWidth - margin[0] * (colNum - 1) - (gLayout.containerPadding?.[0] || margin[0]) * 2) / colNum

    const xInGrid = mouseAt.x - parentRect.left + scrollContainer.scrollLeft
    const yInGrid = mouseAt.y - parentRect.top + scrollContainer.scrollTop

    let gridX = Math.round(xInGrid / (colWidth + margin[0]))
    let gridY = Math.round(yInGrid / (rowHeight + margin[1]))

    gridX = Math.max(0, Math.min(gridX, colNum - dragging.value.w))
    gridY = Math.max(0, gridY)

    if (placeholderIndex === -1) {
      layout.value.push({
        x: gridX,
        y: gridY,
        w: dragging.value.w,
        h: dragging.value.h,
        i: dropId
      })
    } else {
      layout.value[placeholderIndex].x = gridX
      layout.value[placeholderIndex].y = gridY
    }
  } else {
    if (placeholderIndex !== -1) {
      layout.value.splice(placeholderIndex, 1)
    }
  }
}, 50)

function dragEnd() {
  if (!dragging.value) return

  const parentRect = gridWrapper.value?.getBoundingClientRect()

  const placeholderIndex = layout.value.findIndex((item) => String(item.i) === dropId)

  if (placeholderIndex === -1) {
    dragging.value = null
    return
  }

  const placeholder = layout.value[placeholderIndex]
  const mouseInGrid =
    parentRect &&
    mouseAt.x > parentRect.left &&
    mouseAt.x < parentRect.right &&
    mouseAt.y > parentRect.top &&
    mouseAt.y < parentRect.bottom

  if (mouseInGrid) {
    if (dragging.value.type === 'uart') {
      const uartViewExists = layout.value.some(
        (item) => item.widget === textDataViewer && String(item.i) !== dropId
      )
      if (uartViewExists) {
        globalNotify('UART View Widget can only be added once.', 'warning')
        layout.value.splice(placeholderIndex, 1) // remove placeholder
        dragging.value = null
        return
      }
    }

    const newWidget = {
      x: placeholder.x,
      y: placeholder.y,
      w: dragging.value.w,
      h: dragging.value.h,
      i: getNextId(),
      name: dragging.value.type === 'loop' ? 'New Loop Widget' : 'UART Data Viewer',
      static: false,
      widget: markRaw(dragging.value.type === 'loop' ? WidgetLoop : textDataViewer),
      widgetProps: []
    }

    layout.value.splice(placeholderIndex, 1, newWidget as any)
  } else {
    // Not in grid, just remove placeholder
    layout.value.splice(placeholderIndex, 1)
  }

  dragging.value = null
}

const addLoopWidget = () => {
  const nextId = getNextId()
  let y = 0
  if (layout.value.length > 0) {
    y = Math.max(...layout.value.map((item) => item.y + item.h))
  }
  const newWidget = {
    x: 0,
    y: y,
    w: 10,
    h: 5,
    i: nextId,
    name: `New Loop Widget`,
    static: false,
    widget: markRaw(WidgetLoop),
    widgetProps: []
  }
  layout.value.push(newWidget)
}

const addUartViewWidget = () => {
  const uartViewExists = layout.value.some((item) => item.widget === textDataViewer)
  if (uartViewExists) {
    globalNotify('UART View Widget can only be added once.', 'warning')
    return
  }

  const nextId = getNextId()
  let y = 0
  if (layout.value.length > 0) {
    y = Math.max(...layout.value.map((item) => item.y + item.h))
  }

  const newWidget = {
    x: 0,
    y: y,
    w: 10,
    h: 10,
    i: nextId,
    name: 'UART Data Viewer',
    static: false,
    widget: markRaw(textDataViewer),
    widgetProps: []
  }
  layout.value.push(newWidget as any)
}

const deleteWidget = (index: number) => {
  layout.value.splice(index, 1)
}

const layout = ref<any[]>([
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

</script>

<style scoped>
:deep(.el-check-tag) {
  padding: 0;
}
</style>

