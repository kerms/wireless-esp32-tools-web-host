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
      let responseBuffer = ''
      let responseTimeout: number | null = null
      const RESPONSE_WAIT_TIME = 10 // Wait 500ms after last response before resolving
      
      // Index to track which messages we've already processed
      let lastProcessedIndex = dataViewerStore.dataFiltered.length - 1
      
      const stopWatch = watch(
        () => dataViewerStore.dataFiltered,
        (newBuf: IDataBuf[]) => {
          if (isDevMode()) {
            console.log('watch data', newBuf)
          }
          
          // Process only new messages
          for (let i = lastProcessedIndex + 1; i < newBuf.length; i++) {
            const message = newBuf[i]
            if (message.isRX) {
              // Add to response buffer
              responseBuffer += decodeUtf8(message.data)
              
              // Reset timeout to wait for more responses
              if (responseTimeout) {
                clearTimeout(responseTimeout)
              }
              
              responseTimeout = window.setTimeout(() => {
                stopWatch()
                resolve(responseBuffer)
              }, RESPONSE_WAIT_TIME)
            }
          }
          
          // Update last processed index
          lastProcessedIndex = newBuf.length - 1
        },
        { deep: true }
      )

      dataViewerStore.addString(command, false, true)
      
      // Set a maximum timeout in case no response is received
      const maxTimeout = window.setTimeout(() => {
        stopWatch()
        resolve(responseBuffer)
      }, 1000) // 5 seconds maximum wait time
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
