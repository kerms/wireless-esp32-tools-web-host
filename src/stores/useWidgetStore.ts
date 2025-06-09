import { computed, markRaw, ref, toRaw, watch } from 'vue'
import { defineStore } from 'pinia'
import type { WidgetItem } from '@/types/grid'
import { globalNotify } from '@/composables/notification'
import { ElMessageBox } from 'element-plus'
import UartAtCommand from '@/views/widgets/uartAtCommand.vue'
import WidgetLoop from '@/views/widgets/widgetLoop.vue'
import textDataViewer from '@/views/text-data-viewer/textDataViewer.vue'

const componentMap: { [key: string]: any } = {
  WidgetLoop,
  textDataViewer,
  UartAtCommand
}

const getComponentName = (component: any): string | null => {
  const rawComponent = toRaw(component)
  for (const name in componentMap) {
    if (componentMap[name] === rawComponent) {
      return name
    }
  }
  return null
}

const getDefaultLayout = (): WidgetItem[] => [
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
]

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

export const useWidgetStore = defineStore('widget', () => {
  const layout = ref<WidgetItem[]>(getDefaultLayout())

  const editCell = ref(false)
  const editGrid = ref(false)
  const showOptions = ref(true)

  const isUartViewAdded = computed(() =>
    layout.value.some((item) => toRaw(item.widget) === textDataViewer)
  )

  watch(
    () => editGrid.value,
    (newValue) => {
      if (newValue) {
        editCell.value = false
      }
    }
  )

  watch(
    () => editCell.value,
    (newValue) => {
      if (newValue) {
        editGrid.value = false
      }
    }
  )

  const getNextId = (): number => {
    const numericIds = layout.value.map((item) => Number(item.i)).filter((id) => !isNaN(id))
    if (numericIds.length === 0) {
      return 0
    }
    return Math.max(...numericIds) + 1
  }

  const addLoopWidget = () => {
    const nextId = getNextId()
    let y = 0
    if (layout.value.length > 0) {
      y = Math.max(...layout.value.map((item) => item.y + item.h))
    }
    const newWidget: WidgetItem = {
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
    if (isUartViewAdded.value) {
      globalNotify('UART View Widget can only be added once.', 'warning')
      return
    }

    const nextId = getNextId()
    let y = 0
    if (layout.value.length > 0) {
      y = Math.max(...layout.value.map((item) => item.y + item.h))
    }

    const newWidget: WidgetItem = {
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
    layout.value.push(newWidget)
  }

  const deleteWidget = (index: number) => {
    layout.value.splice(index, 1)
  }

  const resetToDefault = () => {
    ElMessageBox.confirm(
      'This will reset your layout to the default settings. Are you sure?',
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
      .then(() => {
        layout.value = getDefaultLayout()
        globalNotify('Layout reset to default.', 'success')
      })
      .catch(() => {
        globalNotify('Layout reset cancelled.', 'info')
      })
  }

  const exportSettings = () => {
    try {
      const layoutToSave = toRaw(layout.value).map((item) => {
        const rawItem = toRaw(item)
        return {
          ...rawItem,
          widget: getComponentName(rawItem.widget),
          widgetProps: rawItem.widgetProps?.map((prop: any) => {
            const rawProp = toRaw(prop)
            return {
              ...rawProp,
              componentType: getComponentName(rawProp.componentType)
            }
          })
        }
      })

      const dataStr = JSON.stringify(layoutToSave, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const exportFileDefaultName = 'at-command-settings.json'

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      globalNotify('Settings exported successfully.', 'success')
    } catch (error) {
      console.error('Failed to export settings:', error)
      globalNotify('Failed to export settings.', 'error')
    }
  }

  const importSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string
          const parsedLayout = JSON.parse(fileContent)

          // Basic validation
          if (!Array.isArray(parsedLayout)) {
            throw new Error('Invalid format: expected an array of widgets.')
          }

          const newLayout = parsedLayout
            .map((item: any) => {
              if (item.widget && componentMap[item.widget]) {
                item.widget = markRaw(componentMap[item.widget])
              } else {
                console.warn(`Unknown widget type "${item.widget}" during import. Skipping item.`)
                return null
              }

              if (item.widgetProps) {
                item.widgetProps.forEach((prop: any) => {
                  if (prop.componentType && componentMap[prop.componentType]) {
                    prop.componentType = markRaw(componentMap[prop.componentType])
                  } else if (prop.componentType) {
                    console.warn(
                      `Unknown componentType "${prop.componentType}" for widget "${item.name}". It will be ignored.`
                    )
                    prop.componentType = null
                  }
                })
                item.widgetProps = item.widgetProps.filter((prop: any) => prop.componentType)
              }
              return item
            })
            .filter(Boolean) // remove null items

          layout.value = newLayout
          globalNotify('Settings imported successfully.', 'success')
        } catch (error: any) {
          console.error('Failed to import settings:', error)
          globalNotify(`Failed to import settings: ${error.message}`, 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const saveLayoutToLocalStorage = () => {
    try {
      const layoutToSave = toRaw(layout.value).map((item) => {
        const rawItem = toRaw(item)
        return {
          ...rawItem,
          widget: getComponentName(rawItem.widget),
          widgetProps: rawItem.widgetProps?.map((prop: any) => {
            const rawProp = toRaw(prop)
            return {
              ...rawProp,
              componentType: getComponentName(rawProp.componentType)
            }
          })
        }
      })
      localStorage.setItem('at-command-layout', JSON.stringify(layoutToSave))
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error)
    }
  }

  const loadLayoutFromLocalStorage = () => {
    const savedLayoutJSON = localStorage.getItem('at-command-layout')
    if (!savedLayoutJSON) return

    try {
      const parsedLayout = JSON.parse(savedLayoutJSON)

      if (!Array.isArray(parsedLayout)) {
        throw new Error('Invalid format in localStorage: expected an array of widgets.')
      }

      const newLayout = parsedLayout
        .map((item: any) => {
          if (item.widget && componentMap[item.widget]) {
            item.widget = markRaw(componentMap[item.widget])
          } else {
            console.warn(`Unknown widget type "${item.widget}" from localStorage. Skipping item.`)
            return null
          }

          if (item.widgetProps) {
            item.widgetProps.forEach((prop: any) => {
              if (prop.componentType && componentMap[prop.componentType]) {
                prop.componentType = markRaw(componentMap[prop.componentType])
              } else if (prop.componentType) {
                console.warn(
                  `Unknown componentType "${prop.componentType}" for widget "${item.name}" from localStorage. It will be ignored.`
                )
                prop.componentType = null
              }
            })
            item.widgetProps = item.widgetProps.filter((prop: any) => prop.componentType)
          }
          return item
        })
        .filter(Boolean) // remove null items

      layout.value = newLayout
      globalNotify('Settings restored from last session.', 'success')
    } catch (error: any) {
      console.error('Failed to load layout from localStorage:', error)
      globalNotify(`Failed to load settings from localStorage: ${error.message}`, 'error')
      localStorage.removeItem('at-command-layout')
    }
  }

  watch(
    layout,
    throttle(() => saveLayoutToLocalStorage(), 1000),
    { deep: true }
  )

  loadLayoutFromLocalStorage()

  return {
    layout,
    editGrid,
    editCell,
    showOptions,
    isUartViewAdded,
    addLoopWidget,
    addUartViewWidget,
    deleteWidget,
    resetToDefault,
    exportSettings,
    importSettings,
    getNextId
  }
})
