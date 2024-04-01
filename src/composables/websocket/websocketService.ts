import MyWorker from '@/composables/websocket/ws.sharedworker?sharedworker'
import {WebsocketWrapper} from "@/composables/websocket/websocketWrapper";
import {toClient, toClientCtrl, toServer} from "@/composables/broadcastChannelDef";
import type {ControlMsg, ServerMsg} from "@/api";
import {ControlEvent, ControlMsgType} from "@/api";
import {isDevMode} from "@/composables/buildMode";

export interface IWebsocketService {
    init(host: string,
         msgCallback: (msg: ServerMsg) => any,
         ctrlCallback: (msg: ControlMsg) => any)
        : void;

    deinit(): void;

    send(msg: ServerMsg): void;
}

/**
 * Websocket that run in a shared worker, shared across tabs
 */
class WebsocketShared implements IWebsocketService{
    private static instance: IWebsocketService;

    private worker: SharedWorker;
    private msgCallback: (msg: ServerMsg) => any;

    private ctrlCallback: (msg: ControlMsg) => any;

    public static getInstance(): IWebsocketService {
        if (!WebsocketShared.instance) {
            if (isDevMode()) {
                console.log("New Shared Worker");
            }
            WebsocketShared.instance = new WebsocketShared();
        }
        return WebsocketShared.instance;
    }

    private constructor() {
        if (isDevMode()) {
            console.log("Shared Websocket init");
        }
        this.msgCallback = () => {}
        this.ctrlCallback = () => {}
        this.messageEventProxy = this.messageEventProxy.bind(this);
        this.controlEventProxy = this.controlEventProxy.bind(this);
        this.worker = new MyWorker();
    }

    init(host: string, msgCallback: (msg: ServerMsg) => any, ctrlCallback: (msg: ControlMsg) => any): void {
        if (isDevMode()) {
            console.log("webworker init");
        }
        toClient.removeEventListener("message", this.messageEventProxy);
        toClientCtrl.removeEventListener("message", this.controlEventProxy);
        this.msgCallback = msgCallback;
        this.ctrlCallback = ctrlCallback;
        toClient.addEventListener("message", this.messageEventProxy);
        toClientCtrl.addEventListener("message", this.controlEventProxy);
        this.worker.port.postMessage({type: ControlMsgType.WS_SET_HOST, data: host} as ControlMsg)
    }

    deinit(): void {
        toClient.removeEventListener("message", this.messageEventProxy);
        toClientCtrl.removeEventListener("message", this.controlEventProxy);
    }

    reload(): void {
        // this.worker.terminate();
    }

    send(msg: ServerMsg): void {
        toServer.postMessage(msg);
    }

    messageEventProxy(ev: MessageEvent<ServerMsg>) {
        this.msgCallback(ev.data);
    }

    controlEventProxy(ev: MessageEvent<ControlMsg>) {

        this.ctrlCallback(ev.data);
    }
}

class WebsocketClassic implements IWebsocketService{
    private static instance: IWebsocketService;
    private socket: WebsocketWrapper;
    private static count: number = 0;

    public static getInstance(): IWebsocketService {
        if (!WebsocketClassic.instance) {
            WebsocketClassic.instance = new WebsocketClassic();
        }
        return WebsocketClassic.instance;
    }

    private constructor() {
        this.socket = new WebsocketWrapper();
        WebsocketClassic.count++;
    }

    init(host: string, msgCallback: (ev: ServerMsg) => any, ctrlCallback: (msg: ControlMsg) => any): void {
        if (isDevMode()) {
            console.log("Websocket Service INIT called", WebsocketClassic.count);
        }
        this.socket.init(host, msgCallback, ctrlCallback);
    }

    deinit(): void {

    }

    send(msg: ServerMsg): void {
        this.socket.send(msg);
    }
}

export function getWebsocketService(): IWebsocketService {
    if (typeof SharedWorker !== 'undefined') {
        return WebsocketShared.getInstance();
    } else {
        return WebsocketClassic.getInstance();
    }
}
