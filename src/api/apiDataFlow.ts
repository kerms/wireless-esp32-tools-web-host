import {type ApiJsonMsg} from '@/api'
import * as api from "@/api/index";

export enum WtDataFlowType {
    NONE = 0,
    SOCKET = 0x10,
    WS_SERVER = 0x11,
    WS_CLIENT,
    WSS_SERVER,
    WSS_CLIENT,
    TCP_SERVER,
    TCP_CLIENT,
    TCP_TLS_SERVER,
    TCP_TLS_CLIENT,
    UDP_SERVER,
    UDP_CLIENT,
    PERIPHERAL = 0x80,
    GPIO = 0x81,
    UART = 0x82,
    I2C,
    I3C,
    SPI,
    I2S,
    CAN,
    RMT,
    USB,
}

export enum WtDataFlowCmd {
    UNKNOWN              = 0,
    GET_INS_LIST         = 1,
    GET_CUR_INS          = 2,
    GET_CUR_ATTACH_LIST  = 3,
    GET_ATTACH_LIST      = 4,
    ATTACH               = 5,
    ATTACH_CUR_TO_RECVER = 6,
    ATTACH_CUR_TO_SENDER = 7,
    DETACH_SINGLE        = 8,
    DETACH_CUR_FROM      = 9,
    SET_DATA_TYPE        = 10,
}

export interface IWtDataFlowJsonMsg extends ApiJsonMsg {
    data_type?: 3 | 4,
    ins_idx?: number,
}

export interface IPeriphInfo {
    periph_num: number;
}

export interface ISocketInfo {
    foreign_port: number;
    foreign_ip: string;
    local_port: number;
}

export interface InstanceInfo {
    ins_idx: number,
    mod_idx: number,
    mod_type: number,
    port_info: ISocketInfo | IPeriphInfo;
}

export interface IInstanceList extends ApiJsonMsg {
    instances: InstanceInfo[],
}

export interface AttachInfo {
    attach_idx: number,
    s_ins_idx: number,
    r_ins_idx: number,
    data_type: 3 | 4,
}

export interface IAttachList extends ApiJsonMsg {
    attaches: AttachInfo[],
}

export function wt_data_flow_get_instance_list() {
    const jsonMsg: IWtDataFlowJsonMsg = {
        cmd: WtDataFlowCmd.GET_INS_LIST,
        module: api.WtModuleID.DATA_FLOW,
    }
    api.sendJsonMsg(jsonMsg);
}

export function wt_data_flow_attach_cur_to_sender(instance_index: number) {
    const jsonMsg: IWtDataFlowJsonMsg = {
        cmd: WtDataFlowCmd.ATTACH_CUR_TO_SENDER,
        module: api.WtModuleID.DATA_FLOW,
        data_type: 3,
        ins_idx: instance_index,
    }
    api.sendJsonMsg(jsonMsg);
}

export function wt_data_flow_get_attach_list() {
    const jsonMsg: IWtDataFlowJsonMsg = {
        cmd: WtDataFlowCmd.GET_ATTACH_LIST,
        module: api.WtModuleID.DATA_FLOW,
    }
    api.sendJsonMsg(jsonMsg);
}
