import type {WtModuleID} from "@/api/index";

export enum WtDataType {
    RESERVED         = 0x00,
    /* primitive type */
    EVENT            = 0x02,
    ROUTE_HDR        = 0x03,
    RAW_BROADCAST    = 0x04,

    /* broadcast data */
    CMD_BROADCAST    = 0x11,

    /* targeted data */
    RAW              = 0x20,
    CMD              = 0x21,
    RESPONSE         = 0x22,

    /* standard protocols */
    PROTOBUF         = 0x40,
    JSON             = 0x41,
    MQTT             = 0x42,
}


export interface ApiBinaryMsg {
    data_type: WtDataType,
    module: WtModuleID,
    sub_mod: number,
    payload: Uint8Array;
}

export function decodeHeader(arrayBuffer: ArrayBuffer) : ApiBinaryMsg {
    // Create a DataView to access the data in the ArrayBuffer
    const dataView = new DataView(arrayBuffer);

    // Extract the data_type from the first byte
    const data_type = dataView.getUint8(0) as WtDataType;

    // Extract the module_id and sub_id from the next bytes
    const module = dataView.getUint8(1);
    const sub_mod = dataView.getUint8(2);

    const payload = new Uint8Array(arrayBuffer.slice(4));

    // Constructing the header object
    return {
        data_type,
        module,
        sub_mod,
        payload,
    };
}