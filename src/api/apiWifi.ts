import {type ApiJsonMsg, sendJsonMsg, WtModuleID} from '@/api'

export enum WifiCmd {
    UNKNOWN = 0,
    WIFI_API_JSON_STA_GET_AP_INFO = 1,
    WIFI_API_JSON_CONNECT         = 2,
    WIFI_API_JSON_GET_SCAN        = 3,
    WIFI_API_JSON_DISCONNECT      = 4,
    WIFI_API_JSON_AP_GET_INFO     = 5,
    WIFI_API_JSON_GET_MODE        = 6,
    WIFI_API_JSON_SET_MODE        = 7,
    WIFI_API_JSON_AP_SET_CRED     = 8,
    WIFI_API_JSON_STA_GET_STATIC_INFO =  9,
    WIFI_API_JSON_STA_SET_STATIC_CONF = 10,
}

export enum WifiMode {
    /* permanent */
    WIFI_AP_AUTO_STA_ON = 0,

    WIFI_AP_STA_OFF     = 4, /* 100 */
    WIFI_AP_OFF_STA_ON  = 5, /* 101 */
    WIFI_AP_ON_STA_OFF  = 6, /* 110 */
    WIFI_AP_STA_ON      = 7, /* 111 */

    /* temporary */
    WIFI_AP_STOP        = 8,
    WIFI_AP_START       = 9,
    WIFI_STA_STOP       = 10,
    WIFI_STA_START      = 11,
}

export enum WifiStatus {
    WIFI_MODE_NULL = 0,  /**< null mode */
    WIFI_MODE_STA,   /**< WiFi station mode */
    WIFI_MODE_AP,    /**< WiFi soft-AP mode */
    WIFI_MODE_APSTA, /**< WiFi station + soft-AP mode */
}

export interface WiFiCredential extends ApiJsonMsg {
    ssid?: string;
    password?: string;
    err?: string;
}

export function wifi_get_scan_list() {
    const msg : WiFiCredential = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_GET_SCAN,
    }
    sendJsonMsg(msg);
}

export function wifi_sta_get_ap_info() {
    const msg : WiFiCredential = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_STA_GET_AP_INFO,
    }
    sendJsonMsg(msg);
}

export function wifi_ap_get_info() {
    const msg : WiFiCredential = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_AP_GET_INFO,
    }
    sendJsonMsg(msg);
}

export function wifi_connect_to(ssid: string, password: string) {
    const msg: WiFiCredential = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_CONNECT,
        ssid: ssid,
        password: password,
    }
    sendJsonMsg(msg);
}

export interface WifiInfo extends ApiJsonMsg {
    rssi: number;
    ssid: string;
    password: string;
    gateway: string;
    ip: string;
    mac: string;
    netmask: string;
    dns_main: string;
    dns_backup: string;
    wifiLogo?: string;
}

export interface WifiScanInfo extends ApiJsonMsg {
    rssi: number;
    ssid: string;
    gateway: string;
    ip: string;
    mac: string;
    netmask: string;
    wifiLogo?: string;
}

export interface WifiList extends ApiJsonMsg {
    scan_list: Array<WifiScanInfo>;
}

export interface IWifiMode extends ApiJsonMsg {
    mode?: WifiMode;
    status?: WifiStatus;
    ap_on_delay?: number;
    ap_off_delay?: number;
    err?: string;
}

export function wifi_set_mode(req_mode: WifiMode, ap_on_delay = -1, ap_off_delay = -1) {
    let msg: IWifiMode;
    if (req_mode === WifiMode.WIFI_AP_AUTO_STA_ON && ap_on_delay !== -1 && ap_off_delay !== -1) {
        msg = {
            module: WtModuleID.WIFI,
            cmd: WifiCmd.WIFI_API_JSON_SET_MODE,
            mode: req_mode,
            ap_on_delay: ap_on_delay,
            ap_off_delay: ap_off_delay,
        };
    } else {
        msg = {
            module: WtModuleID.WIFI,
            cmd: WifiCmd.WIFI_API_JSON_SET_MODE,
            mode: req_mode,
        };
    }
    sendJsonMsg(msg);
}

export function wifi_get_mode() {
    const msg: IWifiMode = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_GET_MODE,
    };

    sendJsonMsg(msg);
}

export function wifi_ap_set_credential(ssid: string, password: string) {
    const msg : WiFiCredential = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_AP_SET_CRED,
        ssid: ssid,
        password: password,
    }
    sendJsonMsg(msg);
}

export interface IWifiStaStaticInfo {
    static_ip_en: number;
    static_dns_en: number;
    ip: string;
    gateway: string;
    netmask: string;
    dns_main: string;
    dns_backup: string;
}
export function wifi_sta_get_static_info() {
    const msg: ApiJsonMsg = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_STA_GET_STATIC_INFO,
    }
    sendJsonMsg(msg);
}

export function wifi_sta_set_static_conf(static_info: IWifiStaStaticInfo) {
    const msg: IWifiStaStaticInfo & ApiJsonMsg = {
        module: WtModuleID.WIFI,
        cmd: WifiCmd.WIFI_API_JSON_STA_SET_STATIC_CONF,
        static_dns_en: static_info.static_dns_en,
        static_ip_en: static_info.static_ip_en,
        ip: static_info.ip,
        gateway: static_info.gateway,
        netmask: static_info.netmask,
        dns_main: static_info.dns_main,
        dns_backup: static_info.dns_backup,
    }
    sendJsonMsg(msg);
}


