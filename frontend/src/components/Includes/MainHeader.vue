<template>
  <header class="main-header">
    <img src="@/assets/logo1.png" alt="Логотип магазина" class="main-logo" @click="$router.push('/')" style="cursor:pointer;" />
    <img src="@/assets/logosq.png" alt="Логотип магазина" class="mobile-logo" @click="$router.push('/')" style="cursor:pointer;" />
    <div class="header-icons">
      <div class="center-icons">
        <button v-if="is_large_screen" class="icon-btn">
          <img src="@/assets/icons/catalog.svg" alt="Каталог" class="icon-img" />
          <span>Каталог</span>
        </button>
        <div class="search-wrapper">
          <input type="text" placeholder="Поиск..." class="search-input" />
          <img src="@/assets/icons/search.svg" alt="Поиск" class="search-icon" />
        </div>
      </div>
      <button v-if="is_large_screen" class="icon-btn" @click="$router.push('/favorites')">
        <img src="@/assets/icons/favorite.svg" alt="Избранное" class="icon-img" />
        <span>Избранное</span>
      </button>
      <button v-if="is_large_screen" class="icon-btn">
        <img src="@/assets/icons/cart.svg" alt="Корзина" class="icon-img" />
        <span>Корзина</span>
      </button>
      <div v-if="is_large_screen">
        <button v-if="!isAuth" class="icon-btn" @click="$emit('login')">
          <img src="@/assets/icons/profile.svg" alt="Войти" class="icon-img" />
          <span>Войти</span>
        </button>
        <button v-else class="icon-btn" @click="$emit('profile')">
          <img src="@/assets/icons/profile.svg" alt="Профиль" class="icon-img" />
          <span>{{ userName || 'Профиль' }}</span>
        </button>
      </div>
    </div>
    <!-- <div class="container d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <nav>
          <a class="admin-link" :class="{active: $route.path==='/users'}" @click.prevent="$router.push('/users')">Пользователи</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/products'}" @click.prevent="$router.push('/products')">Товары</a>
          <span class="divider">/</span>
          <a class="admin-link" :class="{active: $route.path==='/categories'}" @click.prevent="$router.push('/categories')">Категории</a>
        </nav>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">{{ userName }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="logout">Выйти</button>
      </div>
    </div> -->
  </header>
</template>

<script>
import { useScreenWidthLarge } from '@/useScreenWidthLarge';
export default {
  name: 'MainHeader',
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
    setup() {
    const { is_large_screen } = useScreenWidthLarge();  // Используем функцию для получения значения is_large_screen

    return { is_large_screen };  // Возвращаем переменную для использования в шаблоне
  }
}
</script>
