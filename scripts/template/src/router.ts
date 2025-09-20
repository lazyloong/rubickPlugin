import { createMemoryHistory, createRouter } from 'vue-router';

const routes = [
  // { path: '/', component: MainView },
  // { path: '/setting', component: SettingView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
