import {getWebsocketService} from "@/composables/websocket/websocketService";
import type {ApiBinaryMsg} from "@/api/binDataDef";

export interface ApiJsonMsg {
    module: number;
    cmd: number;
}

export enum ControlMsgType {
    WS_EVENT = "WS_EVENT",
    WS_SET_HOST = "WS_SET_HOST",
    WS_GET_STATE = "WS_GET_STATE",
}

export enum ControlEvent {
    DISCONNECTED = "DISCONNECTED",
    LOADED = "LOADED",
    CONNECTED = "CONNECTED",
    CONNECTING = "CONNECTING",
    BROKEN = "BROKEN",
}

export interface ControlMsg {
    type: ControlMsgType,
    data: ControlEvent | string,
}

export interface ServerMsg {
    type: "json" | "binary"
    data: string | ArrayBuffer;
}

export enum WtModuleID {
    WIFI = 1,
    DATA_FLOW = 2,
    UART = 4,
}

export function sendJsonMsg(apiJsonMsg: ApiJsonMsg) {
    const msg: ServerMsg = {
        type: "json",
        data: JSON.stringify(apiJsonMsg),
    };
    getWebsocketService().send(msg);
}

export function sendBinMsg(binMsg: ApiBinaryMsg) {
    const buffer = new Uint8Array(4 + binMsg.payload.length);
    buffer[0] = binMsg.data_type;
    buffer[1] = binMsg.module;
    buffer[2] = binMsg.sub_mod;
    buffer[3] = 0; // Reserved byte
    buffer.set(binMsg.payload, 4); // Append payload after header

    const msg: ServerMsg = {
        type: "binary",
        data: buffer,
    };
    getWebsocketService().send(msg);
}