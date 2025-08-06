<template>
  <div class="main-page">
    <Navigation :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <section class="products-section">
      <h2 class="mb-3">Популярные товары</h2>
      <div class="products-list">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :cart="cart"
          :add-to-cart="addToCart"
          :increment="increment"
          :decrement="decrement"
          :favorites="favorites"
          :add-to-favorites="addToFavorites"
          :remove-from-favorites="removeFromFavorites"
          :is-favorite="isFavorite"
        />
        <div v-if="!products.length" class="text-muted py-4">Нет товаров для отображения</div>
      </div>
    </section>
    <footer class="main-footer">
      <p>&copy; 2025 Магазин запчастей для бытовой техники</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Navigation from './Includes/Navigation.vue';
import ProductCard from './ProductCard.vue';
import { useCart } from '../useCart';
import useFavorites from '../useFavorites';

const userName = ref('');
const products = ref([]);
const role = localStorage.getItem('role') || 'user';
const isAuth = computed(() => !!localStorage.getItem('token'));

const { cart, fetchCart, increment, decrement, addToCart } = useCart();
const { favorites, fetchFavorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

function goLogin() {
  window.location.href = '/login';
}
function goProfile() {
  window.location.href = '/profile';
}

async function fetchUserName() {
  const id = localStorage.getItem('userId');
  if (!id) return;
  try {
    const res = await axios.get(`/api/user/${id}`);
    userName.value = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
  } catch {}
}

async function fetchProducts() {
  try {
    const res = await axios.get('/api/products');
    products.value = res.data;
  } catch {
    products.value = [];
  }
}

onMounted(async () => {
  await fetchProducts();
  await fetchCart();
  await fetchFavorites();
  if (isAuth.value) fetchUserName();
});
</script>
