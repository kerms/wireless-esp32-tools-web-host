import '@/assets/tailwind.css'
import '@/assets/toggle_skewed.css'
import '@/assets/page.css'
import '@/assets/navigation.css'
import 'element-plus/dist/index.css';


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from '@/i18n';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(i18n);
app.use(router)

app.mount('#app')
