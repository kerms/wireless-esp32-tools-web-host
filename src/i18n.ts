import { createI18n } from 'vue-i18n';
import zh from '@/locales/zh'
import en from '@/locales/en'

// const locale = localStorage.getItem('lang') || 'zh';
const locale = 'zh';

console.log("langggggg:", locale);

const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: locale,
    fallbackLocale: 'zh',
    messages: {
        zh,
        // en,
    }
});

export default i18n;
