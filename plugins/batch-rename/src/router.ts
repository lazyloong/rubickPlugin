import { createMemoryHistory, createRouter } from 'vue-router';
import MainView from './view/MainView.vue';

const routes = [
  { path: '/', component: MainView },
  { path: '/main', component: MainView },
  // { path: '/setting', component: SettingView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
