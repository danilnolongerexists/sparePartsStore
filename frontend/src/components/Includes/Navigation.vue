<template>
<div v-if="is_mobile" class="navigation">
  <div class="navigation-menu">
    <button class="icon-btn">
      <img src="@/assets/icons/catalog.svg" alt="Каталог" class="icon-img" />
      <span>Каталог</span>
    </button>
    <button class="icon-btn" @click="$router.push('/favorites')">
      <img src="@/assets/icons/favorite.svg" alt="Избранное" class="icon-img" />
      <span>Избранное</span>
    </button>
    <button class="icon-btn">
      <img src="@/assets/icons/cart.svg" alt="Корзина" class="icon-img" />
      <span>Корзина</span>
    </button>
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
</template>

<script>
import { useScreenWidth } from '@/useScreenWidth';
export default {
  name: 'Navigation',
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
    const { is_mobile } = useScreenWidth();  // Используем функцию для получения значения is_mobile

    return { is_mobile };  // Возвращаем переменную для использования в шаблоне
  }
}
</script>
