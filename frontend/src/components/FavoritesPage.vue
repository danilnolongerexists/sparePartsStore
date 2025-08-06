<template>
  <div>
    <Navigation :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <div class="container py-4">
      <h2 class="mb-4">Избранные товары</h2>
      <div class="products-list">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :cart="cart"
          :add-to-cart="addToCart"
          :increment="increment"
          :decrement="decrement"
          :showFavorite="true"
          :showPrice="true"
          :showName="true"
          :showImage="true"
          :favorites="favorites"
          :add-to-favorites="addToFavorites"
          :remove-from-favorites="removeFromFavorites"
          :is-favorite="isFavorite"
        />
        <div v-if="!products.length" class="text-muted py-4">Нет избранных товаров</div>
        <!-- <div v-if="error" class="text-danger py-4">{{ error }}</div> -->
      </div>
    </div>
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
const error = ref('');
const isAuth = computed(() => !!localStorage.getItem('token'));
const { cart, fetchCart, increment, decrement, addToCart } = useCart();
const { favorites, fetchFavorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
const products = ref([]);

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

onMounted(async () => {
  // Получаем товары с полями (фото, цена и т.д.)
  const userId = localStorage.getItem('userId');
  if (userId) {
    const res = await axios.get('/api/favorites/products', {
      headers: { 'x-user-id': userId }
    });
    products.value = res.data;
  }
  await fetchFavorites();
  await fetchCart();
  if (isAuth.value) fetchUserName();
});
</script>
