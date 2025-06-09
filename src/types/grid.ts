import type { Component } from 'vue'

export interface UartCommandData {
  command: string
  label: string
  response: string
}

export interface DraggableComponent<T = Record<string, any>> {
  id: number
  componentType: Component | string
  props: T
}

export interface WidgetItem {
  x: number
  y: number
  w: number
  h: number
  i: number
  name: string
  static: boolean
  widget: Component | string
  widgetIconName?: string
  widgetProps: DraggableComponent[]
}