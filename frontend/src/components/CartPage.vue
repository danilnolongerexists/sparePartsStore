<template>
  <div class="cart-page">
    <h1>Корзина</h1>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="cart.length === 0">Корзина пуста</div>
    <div v-else>
      <div v-for="item in cart" :key="item.id" class="cart-item">
        <img :src="getImageUrl(getFirstPhoto(item.photos))" alt="" class="cart-item-img" style="cursor:pointer" @click="goToProduct(item.product_id || item.id)" />
        <div class="cart-item-info">
          <div class="cart-item-name" style="cursor:pointer" @click="goToProduct(item.product_id || item.id)">{{ item.name }}</div>
          <div class="cart-item-controls">
            <button @click="decrement(item)">-</button>
            <span style="margin:0 8px">{{ item.quantity }}</span>
            <button @click="increment(item)" :disabled="item.quantity >= (item.product_quantity || 99)">+</button>
          </div>
          <div class="cart-item-price">Цена: {{ item.price }} ₽</div>
        </div>
      </div>
      <div class="cart-total">
        <b>Итого: {{ totalPrice }} ₽</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const cart = ref([]);
const loading = ref(true);
const userId = localStorage.getItem('userId');
const router = useRouter();

function getFirstPhoto(photos) {
  if (!photos) return '';
  try {
    const arr = JSON.parse(photos);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch (e) {}
  if (typeof photos === 'string' && photos.includes(',')) return photos.split(',')[0];
  return photos;
}

const getImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  // Если путь относительный и начинается с /uploads, добавить адрес сервера
  if (img.startsWith('/uploads/')) {
    return window.location.origin.includes('5173')
      ? 'http://localhost:3000' + img
      : img;
  }
  return `http://localhost:3000/uploads/products/${img}`;
};

const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0));

function goToProduct(id) {
  router.push(`/product/${id}`);
}

async function fetchCart() {
  loading.value = true;
  try {
    const { data } = await axios.get(`http://localhost:3000/api/cart/${userId}`);
    cart.value = data;
  } catch (e) {
    cart.value = [];
  } finally {
    loading.value = false;
  }
}

async function increment(item) {
  if (item.quantity >= (item.product_quantity || 99)) return;
  try {
    await axios.post('http://localhost:3000/api/cart', {
      user_id: userId,
      product_id: item.product_id || item.id,
      quantity: item.quantity + 1
    });
    await fetchCart();
  } catch {}
}

async function decrement(item) {
  if (item.quantity > 1) {
    try {
      await axios.post('http://localhost:3000/api/cart', {
        user_id: userId,
        product_id: item.product_id || item.id,
        quantity: item.quantity - 1
      });
      await fetchCart();
    } catch {}
  } else if (item.quantity === 1) {
    try {
      await axios.delete('http://localhost:3000/api/cart', {
        params: { user_id: userId, product_id: item.product_id || item.id }
      });
      await fetchCart();
    } catch {}
  }
}

onMounted(fetchCart);
</script>

<style scoped>
.cart-page { max-width: 700px; margin: 0 auto; padding: 2rem; }
.cart-item { display: flex; align-items: center; margin-bottom: 1.5rem; background: #f9f9f9; border-radius: 8px; padding: 1rem; }
.cart-item-img { width: 80px; height: 80px; object-fit: contain; margin-right: 1rem; border-radius: 6px; background: #fff; }
.cart-item-info { flex: 1; }
.cart-item-name { font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem; }
.cart-item-count, .cart-item-price { color: #555; }
.cart-total { text-align: right; font-size: 1.2rem; margin-top: 2rem; }
</style>
