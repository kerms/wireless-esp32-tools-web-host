import {useSystemStore} from "@/stores/useSystemStore";
import {registerModule} from "@/router/msgRouter";
import {type ApiJsonMsg, ControlEvent, type ControlMsg, ControlMsgType, WtModuleID} from "@/api";
import {type ISysFmInfo, wt_sys_get_fm_info, WtSytemCmd} from "@/api/apiSystem";
import {isDevMode} from "@/composables/buildMode";


export function useSystemModule() {
    const sysStore = useSystemStore()

    function onClientCtrl(msg: ControlMsg) {
        if (msg.type !== ControlMsgType.WS_EVENT) {
            return
        }

        if (msg.data === ControlEvent.CONNECTED) {
            wt_sys_get_fm_info();
            sysStore.rebootInProgress = false;
        }
    }

    function onClientMsg(msg: ApiJsonMsg) {
        switch (msg.cmd as WtSytemCmd) {
            case WtSytemCmd.WT_SYS_REBOOT:
                sysStore.rebootInProgress = true;
                break;
            case WtSytemCmd.WT_SYS_GET_FM_INFO: {
                const fm_info = msg as ISysFmInfo;
                sysStore.curFmInfo.date = fm_info.upd_date;
                sysStore.curFmInfo.ver = fm_info.fm_ver;
                break;
            }
        }
        if (isDevMode()) {
            console.log(msg);
        }
    }

    registerModule(WtModuleID.SYSTEM, {
        ctrlCallback: onClientCtrl,
        serverJsonMsgCallback: onClientMsg,
        serverBinMsgCallback: () => {},
    });
}




