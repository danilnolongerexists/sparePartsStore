<template>
  <div class="category-page">
    <h1>{{ categoryName || 'Категория' }}</h1>
    <div v-if="loading" class="cat-loading">Загрузка...</div>
    <div v-else-if="products.length === 0" class="cat-empty">Нет товаров в этой категории</div>
    <div v-else class="cat-products">
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
  name: 'CategoryPage',
  components: { ProductCard },
  setup(props, { root }) {
    const products = ref([]);
    const loading = ref(true);
    const categoryName = ref('');
    const { cart, fetchCart, increment, decrement, addToCart } = useCart();
    const { favorites, fetchFavorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const instance = getCurrentInstance();
    const getCategoryId = () => instance.proxy.$route.params.id;

    const loadCategory = async (categoryId) => {
      loading.value = true;
      try {
        const res = await axios.get(`/api/products?category_id=${categoryId}`);
        products.value = res.data.products || res.data;
        const catRes = await axios.get(`/api/categories/${categoryId}`);
        categoryName.value = catRes.data.name || '';
        await fetchCart();
        await fetchFavorites();
      } catch (e) {
        products.value = [];
        categoryName.value = '';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadCategory(getCategoryId());
    });

    watch(() => getCategoryId(), (newId, oldId) => {
      if (newId !== oldId) loadCategory(newId);
    });

    return {
      products,
      loading,
      categoryName,
      cart,
      addToCart,
      increment,
      decrement,
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    };
  }
};
</script>

<style scoped>
.category-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.cat-products {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.cat-loading, .cat-empty {
  color: #888;
  margin: 2rem 0;
}
</style>
