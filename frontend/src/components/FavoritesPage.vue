<template>
  <div>
    <MainHeader :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
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
import MainHeader from './MainHeader.vue';
export default {
  name: 'FavoritesPage',
  components: { MainHeader },
  data() {
    return {
      products: [],
      userName: '',
      favoriteIds: []
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
    toggleFavorite(id) {
      const idx = this.favoriteIds.indexOf(id);
      if (idx !== -1) {
        this.favoriteIds.splice(idx, 1);
      }
      this.saveFavorites();
    },
    saveFavorites() {
      const userId = localStorage.getItem('userId') || 'guest';
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(this.favoriteIds));
    },
    loadFavorites() {
      const userId = localStorage.getItem('userId') || 'guest';
      this.favoriteIds = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]');
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
    this.loadFavorites();
    const res = await axios.get('/api/products');
    this.products = res.data;
    this.fetchUserName();
  }
}
</script>

<style scoped>
.products-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
  margin-bottom: 2rem;
}
.product-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(44,62,80,0.07);
  padding: 1rem;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s;
}
.product-card:hover {
  box-shadow: 0 4px 24px rgba(44,62,80,0.13);
}
.product-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.7rem;
  background: #f7f7fa;
  border: 1px solid #e0e0e0;
}
.product-info {
  text-align: center;
}
.product-name {
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.product-price {
  color: #1976d2;
  font-size: 1.1rem;
  font-weight: 700;
}
.favorite-btn {
  background: none;
  border: none;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: filter 0.2s;
  filter: grayscale(1) brightness(1.2);
}
.favorite-btn.active {
  filter: none;
}
.favorite-btn.active img {
  filter: invert(27%) sepia(97%) saturate(7492%) hue-rotate(-8deg) brightness(1.1);
}
</style>
