import type {ControlMsg, ServerMsg} from "@/api";

declare const self: SharedWorkerGlobalScope;

import {WebsocketWrapper} from "@/composables/websocket/websocketWrapper";
import {toClient, toClientCtrl, toServer} from "@/composables/broadcastChannelDef";
import {ControlEvent, ControlMsgType} from "@/api";
import {isDevMode} from "@/composables/buildMode";

const websocket = new WebsocketWrapper();
let host = "";

function ctrlBroadcast(msg: ControlMsg) {
    toClientCtrl.postMessage(msg);
}

function msgBroadcast(msg: ServerMsg) {
    toClient.postMessage(msg);
}

// self.onconnect
self.onconnect = function(event) {
    const port = event.ports[0];
    port.onmessage = function (e: MessageEvent<ControlMsg>) {
        if (isDevMode()) {
            console.log('Received message in SharedWorker:', e.data);
        }
        if (e.data.type === ControlMsgType.WS_SET_HOST) {
            if (host === "" && e.data.data !== "") {
                host = e.data.data;
                websocket.init(host, msgBroadcast, ctrlBroadcast);
            }
        }
    };
    const msg: ControlMsg = {
        type: ControlMsgType.WS_EVENT,
        data: ControlEvent.LOADED,
    }
    port.postMessage(msg);
};

toServer.onmessage = (ev: MessageEvent<ServerMsg>) => {
    websocket.send(ev.data);
};
