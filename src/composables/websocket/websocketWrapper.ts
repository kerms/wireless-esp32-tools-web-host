
import type {ApiJsonMsg, ControlMsg, ServerMsg} from "@/api";
import {ControlEvent, ControlMsgType} from "@/api";
import {isDevMode} from "@/composables/buildMode";


interface IWebsocket {

    close(): void;

    send(msg: ServerMsg): void;
}

class WebsocketDummy implements IWebsocket {
    close(): void {

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    send(msg: ServerMsg) {

    }
}

class OneTimeWebsocket implements IWebsocket {
    private readonly heartBeatTimeout: number = 1;
    private readonly host: string;
    private readonly intervalId: number;
    private readonly msgCallback: (ev: ServerMsg) => any;
    private readonly ctrlCallback: (msg: ControlMsg) => any;
    private readonly closeCallback: () => void;
    private socket: WebSocket;
    private heartBeatTimeCount: number;
    private stoped: boolean;
    private cleared: boolean;
    private hasBeenConnected: boolean;

    constructor(host: string,
                msgCallback: (ev: ServerMsg) => any,
                ctrlCallback: (msg: ControlMsg) => any,
                closeCallback: () => void
    ) {
        this.host = host;
        this.stoped = false;
        this.cleared = false;
        this.hasBeenConnected = false;
        this.msgCallback = msgCallback;
        this.ctrlCallback = ctrlCallback;
        this.closeCallback = closeCallback;
        this.heartBeatTimeCount = 0;
        this.intervalId = 0;

        this.socket = new WebSocket(`ws://${this.host}/ws`);
        this.setSocketProp();

        this.intervalId = setInterval(() => {
            if (this.heartBeatTimeCount > this.heartBeatTimeout) {
                /* did not receive packet "heartBeatTimeout" times,
                 * connection may be lost: close the socket */
                if (this.socket.readyState === this.socket.OPEN) {
                    console.log("No heart beat, break connection");
                    this.close();
                    this.clear();
                }
                if (isDevMode()) {
                    console.log("interval: ", this.heartBeatTimeCount, "state: ", this.socket.readyState);
                }
            }

            this.heartBeatTimeCount++;
        }, 2000);
    }

    private setSocketProp() {
        this.socket.binaryType = 'arraybuffer'
        this.heartBeatTimeCount = 0;

        this.socket.onmessage = (ev) => {
            this.heartBeatTimeCount = 0;
            if (!ev.data)
                return

            const msg: ServerMsg = {
                data: ev.data,
                type: "json",
            }
            if (typeof ev.data === "string") {
                msg.type = "json"
            } else {
                msg.type = "binary";
            }
            this.msgCallback(msg);
        }

        this.socket.onclose = (ev) => {
            if (isDevMode()) {
                console.log("ws closed", ev.reason, ev.code);
            }
            this.socket.onclose = null
            this.socket.onopen = null
            this.socket.onerror = null
            this.socket.onmessage = null;
            this.clear();
        };

        this.socket.onerror = (error) => {
            this.close();
        };

        this.socket.onopen = ev => {
            // console.log('WebSocket Connected');
            if (this.stoped) {
                this.close();
                return;
            }
            this.heartBeatTimeCount = 0;
            this.hasBeenConnected = true;
            const msg: ControlMsg = {
                type: ControlMsgType.WS_EVENT,
                data: ControlEvent.CONNECTED,
            }
            this.ctrlCallback(msg);
        };

        const msg: ControlMsg = {
            type: ControlMsgType.WS_EVENT,
            data: ControlEvent.CONNECTING,
        }
        this.ctrlCallback(msg);
    }

    close() {
        this.stoped = true;
        this.socket.close();
    }

    send(msg: ServerMsg) {
        if (this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        if (isDevMode()) {
            console.log('WebSocket proxies data ', msg);
        }

        this.socket.send(msg.data);
    }

    clear() {
        if (this.cleared) {
            return;
        }
        this.cleared = true;
        clearInterval(this.intervalId);

        const msg: ControlMsg = {
            type: ControlMsgType.WS_EVENT,
            data: ControlEvent.DISCONNECTED,
        }
        this.ctrlCallback(msg);
        this.closeCallback();
    }
}

export class WebsocketWrapper {
    private socket: IWebsocket;
    private msgCallback: (ev: ServerMsg) => any;
    private ctrlCallback: (msg: ControlMsg) => any;
    private timeoutId: number;
    private host: string;
    private stoped: boolean;

    constructor() {
        this.socket = new WebsocketDummy();
        this.msgCallback = () => {};
        this.ctrlCallback = () => {};
        this.timeoutId = 0;
        this.host = "";
        this.stoped = false;

        this.closeCallback = this.closeCallback.bind(this);
    }

    init(host: string,
         msgCallback: (ev: ServerMsg) => any,
         ctrlCallback: (msg: ControlMsg) => any)
    {
        if (this.host === host) {
            return;
        }
        this.newConnection(host, msgCallback, ctrlCallback);
    }

    private newConnection(host: string,
              msgCallback: (ev: ServerMsg) => any,
              ctrlCallback: (msg: ControlMsg) => any)
    {
        this.socket.close();
        this.host = host;
        this.msgCallback = msgCallback;
        this.ctrlCallback = ctrlCallback;
        this.socket = new OneTimeWebsocket(host, this.msgCallback, this.ctrlCallback, this.closeCallback);
    }

    private closeCallback() {
        if (this.stoped) {
            return;
        }
        this.timeoutId = setTimeout(() =>
                this.newConnection(this.host, this.msgCallback, this.ctrlCallback),
            1000);
    }

    deinit() {
        this.socket.close();
        this.stoped = true;
        clearTimeout(this.timeoutId);
    }

    send(msg: ServerMsg) {
        this.socket.send(msg)
    }
}
