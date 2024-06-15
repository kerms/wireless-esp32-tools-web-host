import type {ApiBinaryMsg} from "@/api/binDataDef";
import {WtDataType} from "@/api/binDataDef";
import {type ApiJsonMsg, sendBinMsg, sendJsonMsg, WtModuleID} from "@/api/index";

export enum WtUartCmd {
    UNKNOWN = 0,

    /* UART PERIPHERAL */
    GET_AVAILABLE_NUMS = 1,
    GET_BAUD = 4,
    SET_BAUD = 5,
    GET_CONFIG = 6, /* data bits, parity and stop bits */
    SET_CONFIG = 7,
    GET_FLOW_CTRL, /* flow control function RTS/CTS*/
    SET_FLOW_CTRL,
    GET_PINS_NUM, /* not implemented change pinout function */
    SET_PINS_NUM, /* not implemented */
    GET_MODE, /* not implemented UART/RS485/IrDA */
    SET_MODE, /* not implemented UART/RS485/IrDA */

    GET_STATUS = 20, /* is uart enabled and other information */
    SET_STATUS,      /* set specific uart port disable */
    GET_DATA_TYPE = 22, // 0x03 or 0x04
    SET_DATA_TYPE = 23, // 0x03 or 0x04

    GET_DEFAULT_NUM = 24,
}

enum ANSI_ESCAPE_CODE {
    REFRESH_WINDOW = '\x1b[7t',
    CLEAR_WINDOW = '\x1b[2J'
}

export interface IUartConfig {
    data_bits: 5 | 6 | 7 | 8;
    parity   : 0 | 1 | 2;
    stop_bits: 1 | 15 | 2;
}

export interface IUartMsgConfig extends ApiJsonMsg, IUartConfig {
    sub_mod: number;
}

export interface IUartMsgBaud extends ApiJsonMsg {
    sub_mod: number;
    baud: number;
}

export interface IUartMsgNum extends ApiJsonMsg {
    num: number;
}

export function uart_send_msg(payload: Uint8Array, sub_mod: number) {
    /* hard code uart num for now */
    const msg: ApiBinaryMsg = {
        sub_mod: sub_mod,
        data_type: WtDataType.RAW,
        module: WtModuleID.UART,
        payload: payload,
    }
    sendBinMsg(msg);
}

export function uart_get_baud(uart_num: number) {
    const cmd = {
        cmd: WtUartCmd.GET_BAUD,
        module: WtModuleID.UART,
        sub_mod: uart_num,
    }
    sendJsonMsg(cmd);
}

export function uart_set_baud(baud: number, uart_num: number) {
    const cmd: IUartMsgBaud = {
        cmd: WtUartCmd.SET_BAUD,
        module: WtModuleID.UART,
        baud: baud,
        sub_mod: uart_num,
    }
    sendJsonMsg(cmd);
}

export function uart_get_config(uart_num: number) {
    const cmd = {
        cmd: WtUartCmd.GET_CONFIG,
        module: WtModuleID.UART,
        sub_mod: uart_num,
    }
    sendJsonMsg(cmd);
}

export function uart_set_config(uart_config: IUartConfig, uart_num: number) {
    const cmd: IUartMsgConfig = {
        cmd: WtUartCmd.SET_CONFIG,
        module: WtModuleID.UART,
        sub_mod: uart_num,
        data_bits: uart_config.data_bits,
        parity: uart_config.parity,
        stop_bits: uart_config.stop_bits,
    }
    sendJsonMsg(cmd);
}

export function uart_get_default_num() {
    const cmd = {
        cmd: WtUartCmd.GET_DEFAULT_NUM,
        module: WtModuleID.UART,
    }
    sendJsonMsg(cmd);
}
