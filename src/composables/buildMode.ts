export function isDevMode() {
    return import.meta.env.VITE_APP_MODE === 'dev';
}

export function isOTAEnabled() {
    return import.meta.env.VITE_ENABLE_OTA === 'true';
}

export function isTrialMode() {
    return import.meta.env.VITE_TRIAL_MODE === "true"
}

export function getTrialDate() {
    return import.meta.env.VITE_TRIAL_DATE || "1970-01-01";
}
