import {createI18n} from 'vue-i18n';
import zh from '@/locales/zh'
import en from '@/locales/en'
import fr from '@/locales/fr'

const userLanguage = navigator.language || 'en';

// Get the language code (e.g., 'en' from 'en-US')
export const locale = userLanguage.split('-')[0];
const messages = {
    zh,
    en,
    fr,
} as const;

type Locale = keyof typeof messages;

export const availableLanguages = Object.keys(messages);

// export const locale = 'zh';
console.log(userLanguage, locale, availableLanguages)

const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: locale,
    fallbackLocale: 'zh',
    messages: messages
});

export function getFlagFromLang(lang: string) {
    if (lang === 'zh') {
        return '🇨🇳';
    } else if (lang === 'en') {
        return '🇺🇸';
    } else if (lang === 'fr') {
        return '🇫🇷';
    }
    return '🏳️';
}

export function setLang(lang: string): void {
    if (availableLanguages.includes(lang)) {
        i18n.global.locale.value = lang as Locale;
    }
}

export function getLang() {
    return i18n.global.locale;
}

export default i18n;
