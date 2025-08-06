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
      <div class="product-actions" style="margin-top:1.2rem;display:flex;gap:1.2rem;align-items:center;">
        <button class="favorite-btn" :class="{active: isFavorite(product.id)}" @click="toggleFavorite(product.id)">
          <img src="@/assets/icons/favorite.svg" alt="Избранное" style="width:22px;height:22px;vertical-align:middle;" />

        </button>
        <div class="cart-btns">
          <template v-if="cartItem">
            <button @click="decrement(cartItem)">-</button>
            <span style="margin:0 8px">{{ cartItem.quantity }}</span>
            <button @click="increment(cartItem)" :disabled="cartItem.quantity >= product.quantity">+</button>
          </template>
          <template v-else>
            <button @click="addToCart(product)">В корзину</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useCart } from '../useCart';

const product = ref(null);
const role = localStorage.getItem('role') || 'user';
const favoriteIds = ref([]);
const isAuth = computed(() => !!localStorage.getItem('token'));
const { cart, fetchCart, increment, decrement, addToCart } = useCart();

const photoList = computed(() => {
  if (!product.value || !product.value.photos) return [];
  return product.value.photos.split(',').filter(Boolean);
});

function getPhotoUrl(photo) {
  if (!photo) return '';
  if (photo.startsWith('/uploads/')) {
    return window.location.origin.includes('5173')
      ? 'http://localhost:3000' + photo
      : photo;
  }
  return photo;
}

function isFavorite(id) {
  return favoriteIds.value.includes(id);
}

async function toggleFavorite(id) {
  if (!isAuth.value) return;
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const idx = favoriteIds.value.indexOf(id);
  if (idx === -1) {
    await axios.post('/api/favorites', { product_id: id }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    favoriteIds.value.push(id);
  } else {
    await axios.delete(`/api/favorites/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    favoriteIds.value.splice(idx, 1);
  }
}

const cartItem = computed(() => {
  if (!product.value) return null;
  return cart.value.find(i => (i.product_id || i.id) === product.value.id) || null;
});

async function fetchFavorites() {
  if (!isAuth.value) return;
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const res = await axios.get('/api/favorites', {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    favoriteIds.value = res.data;
  } catch {
    favoriteIds.value = [];
  }
}

onMounted(async () => {
  const id = window.location.pathname.split('/').pop();
  try {
    const res = await axios.get(`/api/products/${id}`);
    product.value = res.data;
    await fetchFavorites();
    await fetchCart();
  } catch {
    product.value = null;
  }
});
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
