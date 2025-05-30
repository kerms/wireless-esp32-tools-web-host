import {createRouter, createWebHistory, type RouteLocationNormalizedLoaded} from 'vue-router'
import Wifi from '@/views/Wifi.vue'
import Feedback from '@/views/Feedback.vue'
import About from '@/views/About.vue'
import Uart from '@/views/Uart.vue'
import Page404 from '@/views/404.vue'
import Update from '@/views/Update.vue'
import {translate} from "@/locales";
import {isOTAEnabled} from "@/composables/buildMode";
import {reactive, watch} from "vue";
import {getLang} from "@/i18n";

const languageState = reactive({
    currentLanguage: getLang(), // Get the current language from your i18n setup
});

interface AppRouteMeta {
    title?: string;
    titleKey?: string;
}

const updateMetaTitles = () => {
    router.getRoutes().forEach(route => {
        const meta = route.meta as AppRouteMeta;
        if (meta.titleKey) {
            meta.title = translate(meta.titleKey);
        }
    });
};

function updateDocumentTitle(route: RouteLocationNormalizedLoaded) {
    const meta = route.meta as AppRouteMeta;
    document.title = typeof route.meta.title === 'string'
        ? `${translate(meta.titleKey || "")} | ${translate('studioYunSi')}`
        : '允斯调试器';
}

// Watch for language changes to update the titles dynamically
watch(() => languageState.currentLanguage, () => {
    // Recompute all route meta titles
    updateMetaTitles();
    updateDocumentTitle(router.currentRoute.value);
}, {deep: true});

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            meta: { titleKey: 'page.home' },
            redirect: () => '/uart',
        }, {
            path: '/home:ext(.*)',
            meta: { titleKey: 'page.home' },
            redirect: () => '/',
        }, {
            path: '/wifi:ext(.*)',
            meta: { titleKey: 'page.wifi' },
            component: Wifi,
        }, {
            path: '/about:ext(.*)',
            meta: { titleKey: 'page.about' },
            component: About,
        }, {
            path: '/uart:ext(.*)',
            meta: { titleKey: 'page.uart' },
            component: Uart,
        }, {
            path: '/feedback:ext(.*)',
            meta: { titleKey: 'page.feedback' },
            name: 'feedback',
            component: Feedback,
        }, {
            path: '/update:ext(.*)',
            meta: { titleKey: 'page.update' },
            name: 'update',
            component: isOTAEnabled() ? Update : Page404,
        }, {
            path: '/:catchAll(.*)', // Catch-all route for 404
            name: 'NotFound',
            component: Page404,
        },
    ]
})

// Update document title dynamically
router.beforeEach((to, from, next) => {
    updateDocumentTitle(to);
    next();
});

// Initialize titles on load
updateMetaTitles();

export default router;