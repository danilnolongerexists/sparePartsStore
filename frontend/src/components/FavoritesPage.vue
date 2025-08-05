<template>
  <div>
    <Navigation :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <div class="container py-4">
      <h2 class="mb-4">Избранные товары</h2>
      <div class="products-list">
        <div v-for="product in favoriteProducts" :key="product.id" class="product-card">
          <img v-if="getFirstPhoto(product.photos)" :src="getFirstPhoto(product.photos)" class="product-img" alt="Фото товара" />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ product.user_price }} ₽</div>
          </div>
          <button class="favorite-btn active" @click="toggleFavorite(product.id)">
            <img src="@/assets/icons/favorite.svg" alt="Избранное" style="width:22px;height:22px;vertical-align:middle;" />
          </button>
        </div>
        <div v-if="!favoriteProducts.length" class="text-muted py-4">Нет избранных товаров</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import MainHeader from './Includes/MainHeader.vue';
import Navigation from './Includes/Navigation.vue';
export default {
  name: 'FavoritesPage',
  components: { MainHeader, Navigation },
  data() {
    return {
      products: [],
      userName: '',
      favoriteIds: [],
      role: localStorage.getItem('role') || 'user'
    }
  },
  computed: {
    isAuth() {
      return !!localStorage.getItem('token');
    },
    favoriteProducts() {
      return this.products.filter(p => this.favoriteIds.includes(p.id));
    }
  },
  methods: {
    goLogin() {
      this.$router.push('/login');
    },
    goProfile() {
      this.$router.push('/profile');
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
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
    async toggleFavorite(id) {
      if (!this.isAuth) return;
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const idx = this.favoriteIds.indexOf(id);
      if (idx === -1) {
        // добавить в избранное
        await axios.post('/api/favorites', { product_id: id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId
          }
        });
        this.favoriteIds.push(id);
      } else {
        // убрать из избранного
        await axios.delete(`/api/favorites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId
          }
        });
        this.favoriteIds.splice(idx, 1);
      }
    },
    async fetchUserName() {
      const id = localStorage.getItem('userId');
      if (!id) return;
      try {
        const res = await axios.get(`/api/user/${id}`);
        this.userName = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
      } catch {}
    }
  },
  async mounted() {
    if (!this.isAuth) {
      this.$router.push('/login');
      return;
    }
    // Получаем избранные товары напрямую с бэка
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const res = await axios.get('/api/favorites/products', {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    this.products = res.data;
    this.favoriteIds = res.data.map(p => p.id);
    this.fetchUserName();
  }
}
</script>
