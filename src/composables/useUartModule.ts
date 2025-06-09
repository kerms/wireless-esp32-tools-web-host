import type { IUartMsgConfig, IUartMsgNum } from '@/api/apiUart'
import type { IUartMsgBaud } from '@/api/apiUart'
import { uart_get_baud, uart_get_config, WtUartCmd } from '@/api/apiUart'
import { useUartStore } from '@/stores/useUartStore'
import { registerModule } from '@/router/msgRouter'
import * as api from '@/api'
import { isDevMode } from './buildMode'
import { useDataViewerStore } from '@/stores/dataViewerStore'
import type { ApiBinaryMsg } from '@/api/binDataDef'
import { ControlEvent } from '@/api'
import * as df from '@/api/apiDataFlow'
import { uart_get_default_num } from '@/api/apiUart'

export function useUartModule() {
  const dataViewerStore = useDataViewerStore()
  const uartStore = useUartStore()

  function updateUartData() {
    /* TODO: hard code for the moment, 0 is UART instance id (can be changed in the future) */
    uart_get_default_num()
    df.wt_data_flow_attach_cur_to_sender(0)
  }

  const onUartJsonMsg = (msg: api.ApiJsonMsg) => {
    switch (msg.cmd as WtUartCmd) {
      case WtUartCmd.GET_BAUD:
      case WtUartCmd.SET_BAUD: {
        const uartMsg = msg as IUartMsgBaud
        if (uartMsg.baud) {
          dataViewerStore.setUartBaud(uartMsg.baud)
        }
        break
      }
      case WtUartCmd.GET_CONFIG:
      case WtUartCmd.SET_CONFIG: {
        const uartMsg = msg as IUartMsgConfig
        dataViewerStore.uartConfig.data_bits = uartMsg.data_bits
        dataViewerStore.uartConfig.stop_bits = uartMsg.stop_bits
        dataViewerStore.uartConfig.parity = uartMsg.parity
        break
      }
      case WtUartCmd.GET_DEFAULT_NUM:
        uartStore.uartNum = (msg as IUartMsgNum).num
        uart_get_baud(uartStore.uartNum)
        uart_get_config(uartStore.uartNum)
        break
      default:
        if (isDevMode()) {
          console.log('uart not treated', msg)
        }
        break
    }
  }

  const onUartBinaryMsg = (msg: ApiBinaryMsg) => {
    if (isDevMode()) {
      console.log('uart', msg)
    }

    dataViewerStore.addSegment(new Uint8Array(msg.payload), true)
  }

  const onClientCtrl = (msg: api.ControlMsg) => {
    if (msg.type !== api.ControlMsgType.WS_EVENT) {
      return
    }

    if (msg.data === ControlEvent.DISCONNECTED) {
      dataViewerStore.acceptIncomingData = false
    } else if (msg.data === ControlEvent.CONNECTED) {
      updateUartData()
      dataViewerStore.acceptIncomingData = true
    }
  }

  registerModule(api.WtModuleID.UART, {
    ctrlCallback: onClientCtrl,
    serverJsonMsgCallback: onUartJsonMsg,
    serverBinMsgCallback: onUartBinaryMsg
  })
}
