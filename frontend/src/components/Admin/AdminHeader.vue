<template>
  <header v-if="isAdmin" class="admin-header bg-light py-2 mb-4 border-bottom">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <nav>
          <a class="admin-link" :class="{active: $route.path==='/users'}" @click.prevent="$router.push('/users')">Пользователи</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/products'}" @click.prevent="$router.push('/products')">Товары</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/categories'}" @click.prevent="$router.push('/categories')">Категории</a>
        </nav>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">{{ userName }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="logout">Выйти</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AdminHeader',
  data() {
    return {
      isAdmin: localStorage.getItem('role') === 'admin',
      userName: localStorage.getItem('userName') || '—',
    };
  },
  mounted() {
    window.addEventListener('storage', this.syncAdminHeader);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncAdminHeader);
  },
  methods: {
    syncAdminHeader() {
      this.isAdmin = localStorage.getItem('role') === 'admin';
      this.userName = localStorage.getItem('userName') || '—';
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      this.syncAdminHeader();
      this.$router.push('/login');
    }
  },
  watch: {
    '$route'() {
      this.syncAdminHeader();
    }
  }
}
</script>
