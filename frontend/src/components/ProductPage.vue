<template>
  <div class="product-page" v-if="product">
    <div class="product-photos">
      <img v-for="(photo, idx) in photoList" :key="idx" :src="getPhotoUrl(photo)" class="product-photo" :alt="product.name" />
    </div>
    <div class="product-info-block">
      <h2 class="product-title">{{ product.name }}</h2>
      <div class="product-categories" v-if="product.category_names && product.category_names.length">
        <span class="category-badge" v-for="cat in product.category_names" :key="cat">{{ cat }}</span>
      </div>
      <div class="product-desc mb-3">{{ product.description }}</div>
      <div class="product-price">
        <span v-if="role==='master'">{{ product.master_price }} ₽ <span class="text-muted">(для мастера)</span></span>
        <span v-else>{{ product.user_price }} ₽ <span class="text-muted">(для пользователя)</span></span>
      </div>
      <div class="product-quantity">В наличии: {{ product.quantity }}</div>
    </div>
  </div>
  <div v-else class="text-center py-5 text-muted">Товар не найден</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ProductPage',
  data() {
    return {
      product: null,
      role: localStorage.getItem('role') || 'user',
    };
  },
  computed: {
    photoList() {
      if (!this.product || !this.product.photos) return [];
      return this.product.photos.split(',').filter(Boolean);
    }
  },
  methods: {
    getPhotoUrl(photo) {
      if (!photo) return '';
      if (photo.startsWith('/uploads/')) {
        return window.location.origin.includes('5173')
          ? 'http://localhost:3000' + photo
          : photo;
      }
      return photo;
    }
  },
  async mounted() {
    const id = this.$route.params.id;
    try {
      const res = await axios.get(`/api/products/${id}`);
      this.product = res.data;
    } catch {
      this.product = null;
    }
  }
}
</script>

<style scoped>
.product-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
}
.product-photos {
  flex: 1 1 320px;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}
.product-photo {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 10px;
  background: #f7f7fa;
  border: 1px solid #e0e0e0;
}
.product-info-block {
  flex: 2 1 340px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.product-categories {
  margin-bottom: 0.7rem;
}
.category-badge {
  display: inline-block;
  background: #e3e9f7;
  color: #1976d2;
  border-radius: 6px;
  padding: 0.2em 0.8em;
  font-size: 0.98rem;
  margin-right: 0.5em;
  margin-bottom: 0.2em;
}
.product-desc {
  font-size: 1.08rem;
  color: #444;
}
.product-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1976d2;
}
.product-quantity {
  font-size: 1.05rem;
  color: #2d3e50;
}
</style>
