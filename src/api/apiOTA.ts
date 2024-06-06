import {type ApiJsonMsg, sendJsonMsg, WtModuleID} from '@/api'

export enum WtOTACmd {
    WT_OTA_GET_UPDATE_INFO      = 1, /* total_size, ver */
    WT_OTA_DO_UPDATE            = 2, /* returns OK, chunk of remaining bytes and total length -> wt_event_manager */
    WT_OTA_GET_PROGRESS         = 3, /* returns chunk of remaining bytes and total length */
    WT_OTA_DO_URL_UPDATE        = 4, /* force update { url: "https://" } */
}

export enum WtOTAProgressStatus {
    OK = "OK",
    IDLE = "IDLE",
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
}

export interface IOTAProgress extends ApiJsonMsg {
    progress: number;
    total_size: number;
    status: string;
}

export interface IOTAFmInfo extends ApiJsonMsg {
    fm_size: number;
    fm_ver: string;
    upd_date: string;
    upd_note: string;
}

export function wt_ota_get_update_info() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.OTA,
        cmd: WtOTACmd.WT_OTA_GET_UPDATE_INFO,
    };
    sendJsonMsg(msg);
}

export function wt_ota_do_update() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.OTA,
        cmd: WtOTACmd.WT_OTA_DO_UPDATE,
    };
    sendJsonMsg(msg);
}

export function wt_ota_get_progress() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.OTA,
        cmd: WtOTACmd.WT_OTA_GET_PROGRESS,
    };
    sendJsonMsg(msg);
}

export function wt_ota_do_url_update(url: string) {
    const msg: ApiJsonMsg & {url: string} = {
        module: WtModuleID.OTA,
        cmd: WtOTACmd.WT_OTA_DO_URL_UPDATE,
        url: url,
    };
    sendJsonMsg(msg);
}
