import {registerModule} from "@/router/msgRouter";
import {type ApiJsonMsg, ControlEvent, type ControlMsg, ControlMsgType, WtModuleID} from "@/api";
import {useUpdateStore} from "@/stores/useUpdateStore";
import {
    type IOTAFmInfo,
    type IOTAProgress,
    WtOTACmd,
    WtOTAProgressStatus,
    wt_ota_get_progress,
    wt_ota_get_update_info,
} from "@/api/apiOTA";
import {isDevMode} from "@/composables/buildMode";
import {useSystemStore} from "@/stores/useSystemStore";

export function useUpdateModule() {
    const updateStore = useUpdateStore()
    const sysStore = useSystemStore()

    function onClientCtrl(msg: ControlMsg) {
        if (msg.type !== ControlMsgType.WS_EVENT) {
            return
        }

        if (msg.data === ControlEvent.CONNECTED) {
            wt_ota_get_update_info();
            wt_ota_get_progress();
        }
    }

    function onClientMsg(msg: ApiJsonMsg) {
        switch (msg.cmd as WtOTACmd) {
            case WtOTACmd.WT_OTA_GET_UPDATE_INFO: {
                const info = msg as IOTAFmInfo;
                Object.assign(updateStore.newFmInfo, info);
                if (updateStore.newFmInfo.fm_ver !== sysStore.curFmInfo.ver && updateStore.newFmInfo.fm_ver[0] !== '-'
                    && (updateStore.updateStatus === 'IDLE' || updateStore.updateStatus === 'FAILED')) {
                    updateStore.canUpdate = true;
                } else {
                    updateStore.canUpdate = false;
                }
                break;
            }
            case WtOTACmd.WT_OTA_DO_UPDATE:
                break;
            case WtOTACmd.WT_OTA_GET_PROGRESS: {
                const progress = msg as IOTAProgress;
                updateStore.updateStatus = progress.status;
                if (progress.total_size !== 0) {
                    updateStore.updateProgress = (progress.progress / progress.total_size) * 100;
                } else {
                    updateStore.updateProgress = 0;
                }
                if (progress.status === WtOTAProgressStatus.IDLE) {
                    if (updateStore.newFmInfo.fm_ver !== sysStore.curFmInfo.ver && updateStore.newFmInfo.fm_ver[0] !== '-') {
                        updateStore.canUpdate = true;
                    } else {
                        updateStore.canUpdate = false;
                    }
                    updateStore.clearProgressInterval();
                    updateStore.progressBarStatus = '';
                } else if (progress.status === WtOTAProgressStatus.FAILED) {
                    if (updateStore.newFmInfo.fm_ver !== sysStore.curFmInfo.ver && updateStore.newFmInfo.fm_ver[0] !== '-') {
                        updateStore.canUpdate = true;
                    } else {
                        updateStore.canUpdate = false;
                    }
                    updateStore.clearProgressInterval();
                    updateStore.progressBarStatus = 'exception';
                } else if (progress.status === WtOTAProgressStatus.IN_PROGRESS) {
                    updateStore.setProgressInterval();
                    updateStore.progressBarStatus = '';
                    updateStore.canUpdate = false;
                } else if (progress.status === WtOTAProgressStatus.OK) {
                    updateStore.clearProgressInterval();
                    updateStore.canUpdate = false;
                    updateStore.progressBarStatus = 'success';
                }
                break;
            }
            default:
                break;
        }

        if (isDevMode()) {
            console.log(msg);
        }
    }

    registerModule(WtModuleID.OTA, {
        ctrlCallback: onClientCtrl,
        serverJsonMsgCallback: onClientMsg,
        serverBinMsgCallback: () => {
        },
    });
}




