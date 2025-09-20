import { createApp } from 'vue';
import 'element-plus/dist/index.css';
import App from '@/view/App.vue';
import { settingStore } from './utils';
import router from './router';

const app = createApp(App);
app.use(router);
app.config.globalProperties.$s = settingStore;
app.mount('#app');
