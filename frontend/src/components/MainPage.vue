<template>
  <div class="main-page">
    <!-- <MainHeader :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" /> -->
    <Navigation :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <section class="products-section">
      <h2 class="mb-3">Популярные товары</h2>
      <div class="products-list">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img v-if="getFirstPhoto(product.photos)" :src="getFirstPhoto(product.photos)" class="product-img" alt="Фото товара" />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">
              <template v-if="role === 'master'">{{ product.master_price }} ₽</template>
              <template v-else>{{ product.user_price }} ₽</template>
            </div>
          </div>
          <button class="favorite-btn" :class="{active: isFavorite(product.id)}" @click="toggleFavorite(product.id)">
            <img src="@/assets/icons/favorite.svg" alt="Избранное" style="width:22px;height:22px;vertical-align:middle;" />
          </button>
        </div>
        <div v-if="!products.length" class="text-muted py-4">Нет товаров для отображения</div>
      </div>
    </section>
    <footer class="main-footer">
      <p>&copy; 2025 Магазин запчастей для бытовой техники</p>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from './Includes/Navigation.vue';
export default {
  name: 'MainPage',
  components: { Navigation },
  data() {
    return {
      userName: '',
      products: [],
      favoriteIds: [],
      role: localStorage.getItem('role') || 'user'
    }
  },
  computed: {
    isAuth() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    goLogin() {
      this.$router.push('/login');
    },
    goProfile() {
      this.$router.push('/profile');
    },
    async fetchUserName() {
      const id = localStorage.getItem('userId');
      if (!id) return;
      try {
        const res = await axios.get(`/api/user/${id}`);
        this.userName = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
      } catch {}
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      // Если путь относительный и начинается с /uploads, добавить адрес сервера
      if (url.startsWith('/uploads/')) {
        return window.location.origin.includes('5173')
          ? 'http://localhost:3000' + url
          : url;
      }
      return url;
    },
    async fetchProducts() {
      try {
        const res = await axios.get('/api/products');
        this.products = res.data;
      } catch {
        this.products = [];
      }
    },
    async fetchFavorites() {
      if (!this.isAuth) return;
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const res = await axios.get('/api/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId
          }
        });
        this.favoriteIds = res.data; // массив id товаров
      } catch {
        this.favoriteIds = [];
      }
    },
    isFavorite(id) {
      return this.favoriteIds.includes(id);
    },
    async toggleFavorite(id) {
      if (!this.isAuth) return;
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const idx = this.favoriteIds.indexOf(id);
      if (idx === -1) {
        await axios.post('/api/favorites', { product_id: id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId
          }
        });
        this.favoriteIds.push(id);
      } else {
        await axios.delete(`/api/favorites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId
          }
        });
        this.favoriteIds.splice(idx, 1);
      }
    },
  },
  async mounted() {
    await this.fetchFavorites();
    await this.fetchProducts();
    if (this.isAuth) this.fetchUserName();
  },
  watch: {
    isAuth(val) {
      if (val) {
        this.fetchUserName();
        this.loadFavorites();
        this.role = localStorage.getItem('role') || 'user';
      } else {
        this.userName = '';
        this.loadFavorites();
        this.role = 'user';
      }
    }
  }
}
</script>
