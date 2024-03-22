import {sendJsonMsg} from '@/composables/broadcastChannelDef'


import {type ApiJsonMsg} from '@/api'

const WifiModuleID = 1;
enum WifiCmd {
    UNKNOWN = 0,
    WIFI_API_JSON_GET_AP_INFO,
    WIFI_API_JSON_CONNECT,
    WIFI_API_JSON_GET_SCAN,
    WIFI_API_JSON_DISCONNECT,
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

export function wifi_get_ap_info() {
    const msg : WifiMsgOut = {
        module: WifiModuleID,
        cmd: WifiCmd.WIFI_API_JSON_GET_AP_INFO,
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

export interface WifiInfo {
    rssi: number;
    ssid: string;
    mac: string;
    wifiLogo?: string;
}

export interface WifiList {
    scan_list: Array<WifiInfo>;
}
