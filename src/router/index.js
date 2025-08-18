import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../views/GameView.vue';
import LoginView from '../views/LoginView.vue';
import AdminView from '../views/AdminView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GameView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;