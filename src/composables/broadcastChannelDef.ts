import {type ApiJsonMsg} from "@/api"
import {getWebsocketService} from "@/composables/websocket/websocketService";

export const toServer = new BroadcastChannel("toServer");
export const toClient = new BroadcastChannel("toClient");
export const toWebsocketCtrl = new BroadcastChannel("toWebsocketCtrl");
export const toClientCtrl = new BroadcastChannel("toClientCtrl");

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
}

export interface ControlMsg {
    type: ControlMsgType,
    data: ControlEvent | string,
}

export interface ServerMsg {
    type: "json" | "binary"
    data: object
}

export function sendJsonMsg(apiJsonMsg: ApiJsonMsg) {
    const msg: ServerMsg = {
        type: "json",
        data: apiJsonMsg,
    };
    getWebsocketService().send(msg);
    // toServer.postMessage(msg);
}

export function sendBinMsg(msg: ApiJsonMsg) {
    // toServer.postMessage(JSON.stringify(msg));
}
