<template>
  <div class="search-results-page">
    <h1>Результаты поиска</h1>
    <div v-if="loading" class="search-loading">Загрузка...</div>
    <div v-else-if="products.length === 0" class="search-empty">Ничего не найдено</div>
    <div v-else class="search-products">
      <div v-for="prod in products" :key="prod.id" class="search-product-item" @click="goToProduct(prod.id)">
        <img v-if="getFirstPhoto(prod.photos)" :src="getFirstPhoto(prod.photos)" class="search-product-img" />
        <div class="search-product-info">
          <div class="search-product-name">{{ prod.name }}</div>
          <div class="search-product-price">{{ prod.user_price }} ₽</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'SearchResultsPage',
  data() {
    return {
      products: [],
      loading: true
    }
  },
  watch: {
    '$route.query.q': {
      immediate: true,
      handler(val) {
        this.fetchResults(val);
      }
    }
  },
  methods: {
    async fetchResults(query) {
      if (!query) {
        this.products = [];
        this.loading = false;
        return;
      }
      this.loading = true;
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(query)}`);
        this.products = Array.isArray(res.data) ? res.data : (res.data.products || []);
      } catch {
        this.products = [];
      } finally {
        this.loading = false;
      }
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
    },
    goToProduct(id) {
      this.$router.push(`/product/${id}`);
    }
  }
}
</script>

<style scoped>
.search-results-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.search-products {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.search-product-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0.7rem 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.search-product-item:hover {
  background: #e6f0ff;
}
.search-product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f5f5;
}
.search-product-info {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.search-product-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #222;
  text-decoration: underline;
}
.search-product-price {
  color: #007bff;
  font-weight: 500;
}
.search-loading, .search-empty {
  color: #888;
  margin: 2rem 0;
}
</style>
