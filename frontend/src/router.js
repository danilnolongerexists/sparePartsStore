import { createRouter, createWebHistory } from 'vue-router';
import UserManagement from './components/Admin/UserManagement.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import MainPage from './components/MainPage.vue';
import ProfilePage from './components/ProfilePage.vue';
import ProductManagement from './components/Admin/ProductManagement.vue';
import CategoryManagement from './components/Admin/CategoryManagement.vue';
import FavoritesPage from './components/FavoritesPage.vue';

const routes = [
  { path: '/', component: MainPage },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/users', component: UserManagement, meta: { requiresAuth: true } },
  { path: '/products', component: ProductManagement, meta: { requiresAuth: true } },
  { path: '/categories', component: CategoryManagement, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/favorites', component: FavoritesPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (to.meta.requiresAuth && !isAuth) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isAuth && role === 'admin') {
    next('/users');
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/users') && isAuth && (role === 'master' || role === 'user')) {
    next('/');
  } else {
    next();
  }
});

export default router;
