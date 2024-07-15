import {type ApiJsonMsg, sendJsonMsg, WtModuleID} from '@/api'

export enum WtSytemCmd {
    WT_SYS_GET_FM_INFO      = 1,
    WT_SYS_REBOOT           = 2,
    WT_SYS_GET_SYS_INFO     = 3,
}

export interface ISysFmInfo extends ApiJsonMsg {
    fm_ver: string;
    upd_date: string;
}

export interface ISysHwInfo extends ApiJsonMsg {
    hw_ver: string;
    mf_date: string;
}

export interface ISysInfo {
    sn: string;
}

export function wt_sys_get_fm_info() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.SYSTEM,
        cmd: WtSytemCmd.WT_SYS_GET_FM_INFO,
    };
    sendJsonMsg(msg);
}

export function wt_sys_reboot() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.SYSTEM,
        cmd: WtSytemCmd.WT_SYS_REBOOT,
    };
    sendJsonMsg(msg);
}

export function wt_sys_get_sys_info() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.SYSTEM,
        cmd: WtSytemCmd.WT_SYS_GET_SYS_INFO,
    };
    sendJsonMsg(msg);
}
