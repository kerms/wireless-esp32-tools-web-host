export function isDevMode() {
    return import.meta.env.VITE_APP_MODE === 'dev';
}