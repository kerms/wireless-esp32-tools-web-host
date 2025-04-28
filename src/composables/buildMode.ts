export function isDevMode() {
    return import.meta.env.VITE_APP_MODE === 'dev';
}

export function isOTAEnabled() {
    return import.meta.env.VITE_ENABLE_OTA === 'true' || false;
}

export function isTrialMode() {
    return import.meta.env.VITE_TRIAL_MODE === "true" || false;
}

export function getTrialDate() {
    return import.meta.env.VITE_TRIAL_DATE || "1970-01-01";
}

export function getTrialMsg() {
    return import.meta.env.VITE_TRIAL_MSG || "感谢您试用允斯开放固件,若您喜欢,欢迎关注我的B站或者加入允斯群,新项目和更新都会在第一时间在这里发布. 使用愉快^_^";
}
