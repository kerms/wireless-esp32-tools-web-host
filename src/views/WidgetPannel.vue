<template>
  <div class="flex flex-col h-screen">
    <div v-show="widgetStore.showOptions" class="flex h-40 overflow-y-auto m-2">
      <div class="flex flex-col gap-2">
        <el-checkbox v-model="widgetStore.editGrid" border class="w-full">{{
          translate('widget.editGrid')
        }}</el-checkbox>
        <el-checkbox v-model="widgetStore.editCell" border class="w-full">{{
          translate('widget.editCell')
        }}</el-checkbox>
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
            <span class="font-bold">{{ translate('widget.loopWidget') }}</span>
            <p class="text-xs">{{ translate('widget.loopWidgetDesc') }}</p>
          </div>
          <el-button @click="widgetStore.addLoopWidget" size="small" class="w-full mt-1">{{
            translate('widget.addGrid')
          }}</el-button>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="w-40 h-24 bg-gray-200 border-2 border-dashed rounded-md p-2 flex flex-col justify-center items-center text-center"
            :class="{
              'cursor-move': !widgetStore.isUartViewAdded,
              'cursor-not-allowed opacity-50': widgetStore.isUartViewAdded
            }"
            :draggable="!widgetStore.isUartViewAdded"
            @dragstart="dragStart('uart', $event)"
            @drag="drag"
            @dragend="dragEnd"
          >
            <span class="font-bold">{{ translate('widget.dataViewer') }}</span>
            <p class="text-xs">{{ translate('widget.dataViewerDesc') }}</p>
          </div>
          <el-button
            @click="widgetStore.addUartViewWidget"
            size="small"
            class="w-full mt-1"
            :disabled="widgetStore.isUartViewAdded"
            >{{ translate('widget.addGrid') }}</el-button
          >
        </div>
        <div class="flex flex-col items-start gap-2 border-l pl-4">
          <div>
            <el-button @click="widgetStore.exportSettings" size="small">{{
              translate('widget.exportSettings')
            }}</el-button>
          </div>
          <div>
            <el-button @click="widgetStore.importSettings" size="small">{{
              translate('widget.importSettings')
            }}</el-button>
          </div>
          <div>
            <el-button type="danger" @click="widgetStore.resetToDefault" size="small">{{
              translate('widget.resetToDefault')
            }}</el-button>
          </div>
        </div>
      </div>
    </div>
    <div ref="gridWrapper" class="flex-1 flex flex-col w-full min-h-0">
      <div class="flex-1 bg-gray-100 overflow-y-auto min-h-0">
        <GridLayout
          ref="gridlayout"
          v-model:layout="widgetStore.layout"
          :col-num="20"
          :row-height="30"
          :is-draggable="widgetStore.editGrid"
          :is-resizable="widgetStore.editGrid"
          :auto-size="false"
          :compact-type="null"
          :vertical-compact="false"
        >
          <grid-item
            v-for="(item, index) in widgetStore.layout"
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
                <InlineSvg :name="getWidgetIconName(item)" width="20"></InlineSvg>
                <el-button
                  v-show="widgetStore.editGrid"
                  type="danger"
                  size="small"
                  class="self-center px-1"
                  @click="widgetStore.deleteWidget(index)"
                >
                  <InlineSvg name="close" width="20"></InlineSvg>
                </el-button>
                <div :id="`tp-widget-before-${item.i}`"></div>
                <div v-if="widgetStore.editGrid" class="w-full">
                  <el-input
                    v-model="item.name"
                    size="small"
                    :placeholder="translate('widget.gridItemName')"
                  />
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
                  v-if="widgetStore.editGrid"
                  :checked="item.static"
                  type="danger"
                  class="self-center px-1"
                  @click="item.static = !item.static"
                >
                  <InlineSvg v-show="item.static" name="lock" width="20"></InlineSvg>
                  <InlineSvg v-show="!item.static" name="lock_open" width="20"></InlineSvg>
                </el-check-tag>
                <div v-show="!widgetStore.editGrid" :id="`tp-widget-${item.i}`"></div>
              </div>

              <div class="bg-white overflow-y-auto flex flex-col flex-grow">
                <component
                  :is="item.widget"
                  v-model="widgetStore.layout[index]"
                  :editCell="widgetStore.editCell"
                />
              </div>
            </template>
            <div v-else class="flex justify-center items-center h-full">
              <p class="font-bold text-white">{{ translate('widget.dropHere') }}</p>
            </div>
          </grid-item>
        </GridLayout>
      </div>
    </div>
  </div>
  <teleport to="#nav-right-slot">
    <ElCheckTag
      :checked="widgetStore.showOptions"
      type="primary"
      @click="widgetStore.showOptions = !widgetStore.showOptions"
      >{{ translate('widget.editGrid') }}</ElCheckTag
    >
  </teleport>
</template>

<script setup lang="ts">
import { markRaw, ref, onMounted, onBeforeUnmount } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { ElInput, ElCheckbox, ElCheckTag, ElButton } from 'element-plus'
import UartAtCommand from './widgets/uartAtCommand.vue'
import WidgetLoop from './widgets/widgetLoop.vue'
import textDataViewer from '@/views/text-data-viewer/textDataViewer.vue'
import { useUartModule } from '@/composables/useUartModule'
import { globalNotify } from '@/composables/notification'
import { useWidgetStore } from '@/stores/useWidgetStore'
import type { WidgetItem } from '@/types/grid'
import { translate } from '@/locales'

const widgetStore = useWidgetStore()

const gridlayout = ref<InstanceType<typeof GridLayout> | null>(null)
const gridWrapper = ref<HTMLElement | null>(null)

const getWidgetIconName = (item: WidgetItem) => {
  if (typeof item.widget === 'object' && item.widget !== null && 'widgetIconName' in item.widget) {
    return (item.widget as any).widgetIconName
  }
  return 'default-icon' // or some other default
}

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

  const placeholderIndex = widgetStore.layout.findIndex((item) => String(item.i) === dropId)

  if (mouseInGrid) {
    const gLayout = gridlayout.value as any
    const colNum = 20
    const rowHeight = 30
    const margin = [10, 10]
    const scrollContainer = gLayout.$el.parentElement
    if (!scrollContainer) return
    const colWidth =
      (gLayout.$el.offsetWidth -
        margin[0] * (colNum - 1) -
        (gLayout.containerPadding?.[0] || margin[0]) * 2) /
      colNum

    const xInGrid = mouseAt.x - parentRect.left + scrollContainer.scrollLeft
    const yInGrid = mouseAt.y - parentRect.top + scrollContainer.scrollTop

    let gridX = Math.round(xInGrid / (colWidth + margin[0]) - dragging.value.w / 2)
    let gridY = Math.round(yInGrid / (rowHeight + margin[1]) - dragging.value.h / 2)

    gridX = Math.max(0, Math.min(gridX, colNum - dragging.value.w))
    gridY = Math.max(0, gridY)

    if (placeholderIndex === -1) {
      widgetStore.layout.push({
        x: gridX,
        y: gridY,
        w: dragging.value.w,
        h: dragging.value.h,
        i: dropId
      } as any)
    } else {
      widgetStore.layout[placeholderIndex].x = gridX
      widgetStore.layout[placeholderIndex].y = gridY
    }
  } else {
    if (placeholderIndex !== -1) {
      widgetStore.layout.splice(placeholderIndex, 1)
    }
  }
}, 50)

function dragEnd() {
  if (!dragging.value) return

  const parentRect = gridWrapper.value?.getBoundingClientRect()

  const placeholderIndex = widgetStore.layout.findIndex((item) => String(item.i) === dropId)

  if (placeholderIndex === -1) {
    dragging.value = null
    return
  }

  const placeholder = widgetStore.layout[placeholderIndex]
  const mouseInGrid =
    parentRect &&
    mouseAt.x > parentRect.left &&
    mouseAt.x < parentRect.right &&
    mouseAt.y > parentRect.top &&
    mouseAt.y < parentRect.bottom

  if (mouseInGrid) {
    if (dragging.value.type === 'uart') {
      const uartViewExists = widgetStore.layout.some(
        (item) => item.widget === textDataViewer && String(item.i) !== dropId
      )
      if (uartViewExists) {
        globalNotify(translate('widget.uartViewOnce'), 'warning')
        widgetStore.layout.splice(placeholderIndex, 1) // remove placeholder
        dragging.value = null
        return
      }
    }

    const newWidget = {
      x: placeholder.x,
      y: placeholder.y,
      w: dragging.value.w,
      h: dragging.value.h,
      i: widgetStore.getNextId(),
      name: dragging.value.type === 'loop' ? 'New Loop Widget' : 'UART Data Viewer',
      static: false,
      widget: markRaw(dragging.value.type === 'loop' ? WidgetLoop : textDataViewer),
      widgetProps: []
    }

    widgetStore.layout.splice(placeholderIndex, 1, newWidget as any)
  } else {
    // Not in grid, just remove placeholder
    widgetStore.layout.splice(placeholderIndex, 1)
  }

  dragging.value = null
}
</script>

<style scoped>
:deep(.el-check-tag) {
  padding: 0;
}
</style>

