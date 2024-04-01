import {type ApiJsonMsg, sendJsonMsg} from '@/api'

export const WifiModuleID = 1;
export enum WifiCmd {
    UNKNOWN = 0,
    WIFI_API_JSON_STA_GET_AP_INFO,
    WIFI_API_JSON_CONNECT,
    WIFI_API_JSON_GET_SCAN,
    WIFI_API_JSON_DISCONNECT,
    WIFI_API_JSON_AP_GET_INFO,
}

interface WifiMsgOut extends ApiJsonMsg {
    ssid?: string;
    password?: string;
}

export function wifi_get_scan_list() {
    const msg : WifiMsgOut = {
        module: WifiModuleID,
        cmd: WifiCmd.WIFI_API_JSON_GET_SCAN,
    }
    sendJsonMsg(msg);
}

export function wifi_sta_get_ap_info() {
    const msg : WifiMsgOut = {
        module: WifiModuleID,
        cmd: WifiCmd.WIFI_API_JSON_STA_GET_AP_INFO,
    }
    sendJsonMsg(msg);
}

export function wifi_ap_get_info() {
    const msg : WifiMsgOut = {
        module: WifiModuleID,
        cmd: WifiCmd.WIFI_API_JSON_AP_GET_INFO,
    }
    sendJsonMsg(msg);
}

export function wifi_connect_to(ssid: string, password: string) {
    const msg: WifiMsgOut = {
        module: WifiModuleID,
        cmd: WifiCmd.WIFI_API_JSON_CONNECT,
        ssid: ssid,
        password: password,
    }
    sendJsonMsg(msg);
}

export interface WifiInfo extends ApiJsonMsg {
    rssi: number;
    ssid: string;
    gateway: string;
    ip: string;
    mac: string;
    netmask: string;
    wifiLogo?: string;
}

export interface WifiList {
    scan_list: Array<WifiInfo>;
}
