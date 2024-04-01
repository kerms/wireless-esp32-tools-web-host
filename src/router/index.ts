import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/views/Home.vue'
import Wifi from '@/views/Wifi.vue'
import Feedback from '@/views/Feedback.vue'
import About from '@/views/About.vue'
import Uart from '@/views/Uart.vue'
import {translate} from "@/locales";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            meta: {title: translate("page.home")},
            component: Home
        }, {
            path: '/home:ext(.*)',
            meta: {title: translate("page.home")},
            redirect: () => '/',
        }, {
            path: '/wifi:ext(.*)',
            meta: {title: translate('page.wifi')},
            component: Wifi,
        }, {
            path: '/about:ext(.*)',
            meta: {title: translate('page.about')},
            component: About,
        }, {
            path: '/uart:ext(.*)',
            meta: {title: translate('page.uart')},
            component: Uart,
        }, {
            path: '/feedback:ext(.*)',
            meta: {title: translate('page.feedback')},
            name: 'feedback',
            component: Feedback,
        },
    ]
})

router.beforeEach((to, from, next) => {
    document.title = typeof to.meta.title === 'string' ? to.meta.title + " | 允斯工作室" : '允斯调试器';
    next();
});

export default router
