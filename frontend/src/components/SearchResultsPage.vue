<template>
  <div class="search-results-page">
    <h1>Результаты поиска</h1>
    <div v-if="loading" class="search-loading">Загрузка...</div>
    <div v-else-if="products.length === 0" class="search-empty">Ничего не найдено</div>
    <div v-else class="search-products">
      <ProductCard
        v-for="prod in products"
        :key="prod.id"
        :product="prod"
        :cart="cart"
        :add-to-cart="addToCart"
        :increment="increment"
        :decrement="decrement"
        :favorites="favorites"
        :add-to-favorites="addToFavorites"
        :remove-from-favorites="removeFromFavorites"
        :is-favorite="isFavorite"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ProductCard from './ProductCard.vue';
import { useCart } from '../useCart';
import { useFavorites } from '../useFavorites';
import { ref, onMounted, watch, getCurrentInstance } from 'vue';

export default {
  name: 'SearchResultsPage',
  components: { ProductCard },
  setup() {
    const products = ref([]);
    const loading = ref(true);
    const { cart, fetchCart, increment, decrement, addToCart } = useCart();
    const { favorites, fetchFavorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

    const fetchResults = async (query) => {
      if (!query) {
        products.value = [];
        loading.value = false;
        return;
      }
      loading.value = true;
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(query)}`);
        products.value = Array.isArray(res.data) ? res.data : (res.data.products || []);
      } catch {
        products.value = [];
      } finally {
        loading.value = false;
      }
    };



    // Используем $route.query.q для реактивного поиска
    const instance = getCurrentInstance();
    watch(
      () => instance.proxy.$route.query.q,
      (q) => {
        fetchResults(q);
      },
      { immediate: true }
    );

    onMounted(() => {
      fetchCart();
      fetchFavorites();
    });

    const goToProduct = (id) => {
      window.location.href = `/product/${id}`;
    };

    return {
      products,
      loading,
      cart,
      increment,
      decrement,
      addToCart,
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      goToProduct
    };
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
  flex-wrap: wrap;
  gap: 1.2rem;
}
.search-loading, .search-empty {
  color: #888;
  margin: 2rem 0;
}
</style>
