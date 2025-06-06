import { useDataViewerStore } from '@/stores/dataViewerStore'
import { watch } from 'vue'
import type { IDataBuf } from '@/stores/dataViewerStore'
import { isDevMode } from '@/composables/buildMode'

function decodeUtf8(u8Arr: Uint8Array) {
  try {
    const decoder = new TextDecoder()
    const decodedText = decoder.decode(u8Arr) // Attempt to decode
    return decodedText.replace(/\uFFFD/g, '') // Remove all � characters
  } catch (error) {
    return ''
  }
}

export function useSequentialUart() {
  const dataViewerStore = useDataViewerStore() as any

  async function sendCommand(command: string): Promise<string> {
    return new Promise((resolve) => {
      const stopWatch = watch(
        () => dataViewerStore.dataFiltered,
        (newBuf: IDataBuf[]) => {
          if (isDevMode()) {
            console.log('watch data', newBuf)
          }
          if (newBuf.length > 0) {
            const lastMessage = newBuf[newBuf.length - 1]
            if (lastMessage.isRX) {
              stopWatch()
              resolve(decodeUtf8(lastMessage.data))
            }
          }
        },
        { deep: true }
      )

      dataViewerStore.addString(command, false, true)
    })
  }

  async function sendCommands(commands: string[]): Promise<string[]> {
    const responses: string[] = []
    for (const command of commands) {
      const response = await sendCommand(command)
      responses.push(response)
    }
    if (isDevMode()) {
      console.log('sendCommands', responses)
    }
    return responses
  }

  return { sendCommands }
}
