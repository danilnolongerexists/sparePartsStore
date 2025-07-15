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

<style scoped>
.admin-header {
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
}
.admin-link {
  color: #1976d2;
  text-decoration: underline;
  margin: 0 0.5em;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}
.admin-link.active {
  color: #222;
  text-decoration: none;
  font-weight: 700;
  cursor: default;
}
.divider {
  color: #888;
  margin: 0 0.2em;
}
</style>
