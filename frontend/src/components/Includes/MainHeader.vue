<template>
  <header class="main-header">
    <img src="@/assets/logo1.png" alt="Логотип магазина" class="main-logo" @click="$router.push('/')" style="cursor:pointer;" />
    <img src="@/assets/logosq.png" alt="Логотип магазина" class="mobile-logo" @click="$router.push('/')" style="cursor:pointer;" />
    <div v-if="isAdminPage" class="container d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <nav>
          <a class="admin-link" :class="{active: $route.path==='/users'}" @click.prevent="$router.push('/users')">Пользователи</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/products'}" @click.prevent="$router.push('/products')">Товары</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/categories'}" @click.prevent="$router.push('/categories')">Категории</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/orders'}" @click.prevent="$router.push('/orders')">Заказы</a>
        </nav>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">{{ userName }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="logout">Выйти</button>
      </div>
    </div>
    <div v-else class="header-icons">
      <div class="center-icons">
        <div class="catalog-dropdown-wrapper" @mouseenter="showCategories = true" @mouseleave="showCategories = false">
          <button v-if="is_large_screen" class="icon-btn">
            <img src="@/assets/icons/catalog.svg" alt="Каталог" class="icon-img" />
            <span>Каталог</span>
          </button>
          <div v-if="showCategories" class="catalog-dropdown">
            <div v-if="categories.length === 0" class="dropdown-empty">Загрузка...</div>
            <ul v-else>
              <li v-for="cat in categories" :key="cat.id" @click="$router.push(`/category/${cat.id}`)" class="cat-li">
                <span class="cat-photo-block">
                  <img v-if="getCategoryPhoto(cat)" :src="getCategoryPhoto(cat)" alt="" class="cat-photo" />
                </span>
                <span class="cat-name-block">{{ cat.name }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="search-wrapper" style="position:relative;">
          <form @submit.prevent="goToSearchPage" style="display: flex; align-items: center; width:100%;">
            <img src="@/assets/icons/search.svg" alt="Поиск" class="search-icon" style="cursor:pointer" @mousedown.prevent="goToSearchPage" />
            <input type="text" v-model="searchQuery" @input="onSearchInput" placeholder="Поиск..." class="search-input" @focus="showSearchResults = true" @blur="onSearchBlur" @keydown.enter="goToSearchPage" />
          </form>
          <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
            <div v-for="prod in searchResults" :key="prod.id" class="search-result-item">
              <img v-if="getFirstPhoto(prod.photos)" :src="getFirstPhoto(prod.photos)" class="search-result-img" @mousedown.prevent="goToProduct(prod.id)" />
              <span class="search-result-name" @mousedown.prevent="goToProduct(prod.id)">{{ prod.name }}</span>
              <span class="search-result-price">{{ prod.user_price }} ₽</span>
            </div>
          </div>
        </div>
      </div>
      <button v-if="is_large_screen" class="icon-btn" @click="$router.push('/favorites')">
        <img src="@/assets/icons/favorite.svg" alt="Избранное" class="icon-img" />
        <span>Избранное</span>
      </button>
      <button v-if="is_large_screen" class="icon-btn" @click="$router.push('/cart')">
        <img src="@/assets/icons/cart.svg" alt="Корзина" class="icon-img" />
        <span>Корзина</span>
      </button>
      <div v-if="is_large_screen">
        <button v-if="!isAuth" class="icon-btn" @click="showAuthModal = true">
          <img src="@/assets/icons/profile.svg" alt="Войти" class="icon-img" />
          <span>Войти</span>
        </button>
        <button v-else class="icon-btn" @click="$emit('profile')">
          <img src="@/assets/icons/profile.svg" alt="Профиль" class="icon-img" />
          <span>{{ userName || 'Профиль' }}</span>
        </button>
      </div>
    </div>
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" @success="onAuthSuccess" />
  </header>
</template>

<script>
import { useScreenWidthLarge } from '@/useScreenWidthLarge';
import AuthModal from '../AuthModal.vue';
import axios from 'axios';
export default {
  name: 'MainHeader',
  components: { AuthModal },
  props: {
    isAuth: {
      type: Boolean,
      required: true
    },
    userName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showAuthModal: false,
      showCategories: false,
      categories: [],
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      searchTimeout: null
    }
  },
  computed: {
    isAdminPage() {
      return ['/users', '/products', '/categories', '/orders'].includes(this.$route.path);
    }
  },
  setup() {
    const { is_large_screen } = useScreenWidthLarge();
    return { is_large_screen };
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await axios.get('/api/categories');
        this.categories = res.data;
      } catch (e) {
        this.categories = [];
      }
    },
    getCategoryPhoto(cat) {
      if (!cat.photos) return '';
      let photo = cat.photos;
      try {
        const arr = JSON.parse(cat.photos);
        if (Array.isArray(arr) && arr.length > 0) photo = arr[0];
      } catch (e) {
        if (typeof cat.photos === 'string' && cat.photos.includes(',')) photo = cat.photos.split(',')[0];
      }
      if (photo.startsWith('http')) return photo;
      if (photo.startsWith('/uploads/')) {
        return window.location.origin.includes('5173')
          ? 'http://localhost:3000' + photo
          : photo;
      }
      return `http://localhost:3000/uploads/categories/${photo}`;
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
    },
    onAuthSuccess() {
      this.showAuthModal = false;
      this.$emit('login');
    },
    logout() {
      localStorage.clear();
      window.location.reload();
    },
    goToProduct(id) {
      this.$router.push(`/product/${id}`);
      this.showSearchResults = false;
    },
    goToSearchPage() {
      if (!this.searchQuery.trim()) return;
      this.showSearchResults = false;
      this.$router.push({ path: '/search', query: { q: this.searchQuery.trim() } });
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout);
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }
      this.searchTimeout = setTimeout(this.fetchSearchResults, 300);
    },
    async fetchSearchResults() {
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(this.searchQuery)}`);
        this.searchResults = Array.isArray(res.data) ? res.data : (res.data.products || []);
      } catch {
        this.searchResults = [];
      }
    },
    onSearchBlur() {
      setTimeout(() => { this.showSearchResults = false; }, 200);
    },
  }
}
</script>

<style scoped>
.catalog-dropdown-wrapper {
  position: relative;
  display: inline-block;
}
.catalog-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 1000;
  min-width: 180px;
  padding: 0.5rem 0;
}
.catalog-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.catalog-dropdown li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.catalog-dropdown li:hover {
  background: #f0f0f0;
}
.dropdown-empty {
  padding: 0.5rem 1rem;
  color: #888;
}
.cat-li {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cat-photo-block {
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}
.cat-photo {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}
.cat-name-block {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
}
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 2000;
  max-height: 320px;
  overflow-y: auto;
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.search-result-item:hover {
  background: #f0f0f0;
}
.search-result-img {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}
.search-result-name {
  flex: 1 1 auto;
  color: #222;
  font-weight: 500;
  text-decoration: underline;
}
.search-result-price {
  color: #007bff;
  font-weight: 500;
  margin-left: 8px;
}
</style>
