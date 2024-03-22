import type {ServerMsg, ControlMsg} from "@/composables/broadcastChannelDef";
import {ControlEvent, ControlMsgType} from "@/composables/broadcastChannelDef";


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
    private readonly heartBeatTimeout: number = 2;
    private readonly host: string;
    private readonly intervalId: number;
    private readonly msgCallback: (ev: ServerMsg) => any;
    private readonly ctrlCallback: (msg: ControlMsg) => any;
    private readonly closeCallback: () => void;
    private socket: WebSocket;
    private heartBeatTimeCount: number;
    private stoped: boolean;

    constructor(host: string,
                msgCallback: (ev: ServerMsg) => any,
                ctrlCallback: (msg: ControlMsg) => any,
                closeCallback: () => void
    ) {
        this.host = host;
        this.stoped = false;
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
                this.socket.close();
                console.log("interval: ", this.heartBeatTimeCount, "state: ", this.socket.readyState);
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
                data: {},
                type: "json",
            }
            this.msgCallback(msg);
            if (typeof ev.data === "string") {
                try {
                    msg.data = JSON.parse(ev.data);
                    this.msgCallback(msg);
                } catch (e) {
                    return;
                }
            } else {
                console.log(typeof ev.data);
            }
        }

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');

            clearInterval(this.intervalId);
            this.socket.onclose = null
            this.socket.onopen = null
            this.socket.onerror = null
            this.socket.onmessage = null;

            const msg: ControlMsg = {
                type: ControlMsgType.WS_EVENT,
                data: ControlEvent.DISCONNECTED,
            }
            this.ctrlCallback(msg);
            this.closeCallback();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error', error);
            this.socket.close();
        };

        this.socket.onopen = ev => {
            console.log('WebSocket Connected');
            if (this.stoped) {
                this.close();
                return;
            }
            this.heartBeatTimeCount = 0;
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

        console.log('WebSocket proxies data ', msg);
        if (msg.type === "binary") {
            // this.socket.send(msg.data);
        } else if (msg.type === "json") {
            this.socket.send(JSON.stringify(msg.data));
        }
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
            2000);
    }

    deinit() {
        this.socket.close();
        this.stoped = true;
        clearTimeout(this.timeoutId);
    }

    send(msg: ServerMsg) {
        console.log('WebSocket send: not ready', msg);
        // this.socket.send(msg)
    }
}
