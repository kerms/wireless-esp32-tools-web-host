import type {ApiJsonMsg, ControlMsg, ServerMsg} from "@/api";
import {isDevMode} from "@/composables/buildMode";
import {type ApiBinaryMsg, decodeHeader} from "@/api/binDataDef";

export interface IModuleCallback {
    ctrlCallback: (msg: ControlMsg) => void;
    serverJsonMsgCallback: (msg: ApiJsonMsg) => void;
    serverBinMsgCallback: (msg: ApiBinaryMsg) => void;
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
    if (msg.type === "json") {
        let jsonMsg: ApiJsonMsg;
        try {
            jsonMsg = JSON.parse(msg.data as string) as ApiJsonMsg;
            if (jsonMsg.cmd === undefined ||
                jsonMsg.module === undefined
            ){
                console.log("Server msg has no cmd or module", msg.data);
                return;
            }
        } catch (e) {
            console.log(e);
            return;
        }

        const module = jsonMsg.module;
        const moduleHandler = moduleMap.get(module);
        if (moduleHandler) {
            moduleHandler.serverJsonMsgCallback(jsonMsg);
        } else {
            if (isDevMode()) {
                console.log("routeModuleServerMsg module not loaded", module);
            }
        }
    } else {
        const arr = msg.data as ArrayBuffer;
        if (arr.byteLength < 4) {
            if (isDevMode()) {
                console.log("binary message too short");
            }
            return;
        }

        const binaryMsg = decodeHeader(msg.data as ArrayBuffer);
        const moduleHandler = moduleMap.get(binaryMsg.module);
        if (moduleHandler) {
            moduleHandler.serverBinMsgCallback(binaryMsg);
        } else {
            if (isDevMode()) {
                console.log("routeModuleServerMsg ignored:", msg, binaryMsg);
            }
        }
    }
}

export function routeCtrlMsg(msg: ControlMsg) {
    for (const item of moduleMap) {
        item[1].ctrlCallback(msg);
    }
}
