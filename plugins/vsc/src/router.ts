import SettingView from '@/view/SettingView.vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import MainView from './view/MainView.vue';

const routes = [
  { path: '/', component: MainView },
  { path: '/setting', component: SettingView },
  { path: '/main', component: MainView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
