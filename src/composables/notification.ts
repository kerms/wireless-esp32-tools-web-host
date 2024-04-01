import {ElMessage, ElNotification} from "element-plus";

type NotificationType = 'error'  | 'warning' | 'info' | 'success' ;

export function globalNotify(msg: string, type: NotificationType) {
    ElMessage({
        message: msg,
        grouping: true,
        type: type,
        duration: 2000,
        showClose: true,
        offset: 50,
    })
}

export function globalNotifyRightSide(msg: string, type: NotificationType) {
    ElNotification({
        message: msg,
        type: type,
        duration: 1500,
    })
}
