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