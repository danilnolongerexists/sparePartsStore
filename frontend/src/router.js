import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  routes: [
    {
      name: 'home',
      path: '/',
      component: () => import('./components/MainPage.vue'),
      meta: {
        title: 'D-Detal | Главная'
      }
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('./components/Login.vue'),
      meta: {
        title: 'D-Detal | Вход',
      }
    },
    {
      name: 'register',
      path: '/register',
      component: () => import('./components/Register.vue'),
      meta: {
        title: 'D-Detal | Регистрация',
      }
    },
    {
      name: 'users',
      path: '/users',
      component: () => import('./components/Admin/UserManagement.vue'),
      meta: {
        title: 'D-Detal | Управление пользователями',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'products',
      path: '/products',
      component: () => import('./components/Admin/ProductManagement.vue'),
      meta: {
        title: 'D-Detal | Управление товарами',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'categories',
      path: '/categories',
      component: () => import('./components/Admin/CategoryManagement.vue'),
      meta: {
        title: 'D-Detal | Управление категориями',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'profile',
      path: '/profile',
      component: () => import('./components/ProfilePage.vue'),
      meta: {
        title: 'D-Detal | Профиль',
        requiresAuth: true
      }
    },
    {
      name: 'favorites',
      path: '/favorites',
      component: () => import('./components/FavoritesPage.vue'),
      meta: {
        title: 'D-Detal | Избранное',
        requiresAuth: true
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return;
    return { top: 0, behavior: 'smooth' };
  },
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

// Динамическая установка title вкладки
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
});
