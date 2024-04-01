import type {ApiJsonMsg, ControlMsg, ServerMsg} from "@/api";

export interface IModuleCallback {
    ctrlCallback: (msg: ControlMsg) => void;
    serverMsgCallback: (msg: ServerMsg) => void;
}

const moduleMap = new Map<number, IModuleCallback>();

export function registerModule(moduleId: number, moduleCallback: IModuleCallback): boolean {
    if (moduleMap.has(moduleId)) {
        return false;
    }

    moduleMap.set(moduleId, moduleCallback);
    return true;
}

export function unregisterModule(moduleId: number) {
    moduleMap.delete(moduleId);
}

export function routeModuleServerMsg(msg: ServerMsg) {
    if (msg.type == "json") {
        const module = (msg.data as ApiJsonMsg).module;
        const moduleHandler = moduleMap.get(module);
        if (moduleHandler) {
            moduleHandler.serverMsgCallback(msg);
        } else {
            console.log("routeModuleServerMsg module not loaded", module);
        }
    } else {
        console.log("routeModuleServerMsg ignored:", msg);
    }
}

export function routeCtrlMsg(msg: ControlMsg) {
    for (const item of moduleMap) {
        item[1].ctrlCallback(msg);
    }
}
