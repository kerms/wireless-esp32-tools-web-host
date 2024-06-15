import {registerModule} from "@/router/msgRouter";
import {type ApiJsonMsg, ControlEvent, type ControlMsg, ControlMsgType, WtModuleID} from "@/api";
import {isDevMode} from "@/composables/buildMode";
import {useDataFlowStore} from "@/stores/useDataFlowStore";
import {type IInstanceList, WtDataFlowCmd} from "@/api/apiDataFlow";


export function useDataFlowModule() {
    const dfStore = useDataFlowStore()

    function onClientCtrl(msg: ControlMsg) {
        if (msg.type !== ControlMsgType.WS_EVENT) {
            return
        }
    }

    function onClientMsg(msg: ApiJsonMsg) {
        switch (msg.cmd as WtDataFlowCmd) {
            case WtDataFlowCmd.GET_INS_LIST: {
                const insList = msg as IInstanceList;
                dfStore.instanceList = insList.instances;
                break;
            }
            case WtDataFlowCmd.GET_ATTACH_LIST: {
                break;
            }
            default:
                break;
        }
        if (isDevMode()) {
            console.log(msg);
        }
    }

    registerModule(WtModuleID.DATA_FLOW, {
        ctrlCallback: onClientCtrl,
        serverJsonMsgCallback: onClientMsg,
        serverBinMsgCallback: () => {},
    });
}




