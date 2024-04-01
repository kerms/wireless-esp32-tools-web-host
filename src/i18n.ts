import { createI18n } from 'vue-i18n';
import zh from '@/locales/zh'
import en from '@/locales/en'

// const locale = localStorage.getItem('lang') || 'zh';
export const locale = 'zh';

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
