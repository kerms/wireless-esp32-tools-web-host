// Define a fallback mock class only if BroadcastChannel is undefined
const BC: typeof BroadcastChannel = typeof BroadcastChannel !== 'undefined'
    ? BroadcastChannel
    : class {
        constructor(name: string) {
            // no-op
        }
        postMessage(_: any) {}
        close() {}
        addEventListener(_: string, __: any) {}
        removeEventListener(_: string, __: any) {}
    } as unknown as typeof BroadcastChannel;

export const toServer = new BC("toServer");
export const toClient = new BC("toClient");
export const toWebsocketCtrl = new BC("toWebsocketCtrl");
export const toClientCtrl = new BC("toClientCtrl");