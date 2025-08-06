<template>
  <div class="product-card">
    <img
      v-if="showImage && getFirstPhoto(product.photos)"
      :src="getFirstPhoto(product.photos)"
      class="product-img"
      alt="Фото товара"
      style="cursor:pointer"
      @click="goToProduct(product.id)"
    />
    <div class="product-info">
      <div v-if="showName" class="product-name" style="cursor:pointer" @click="goToProduct(product.id)">{{ product.name }}</div>
      <div v-if="showPrice" class="product-price">
        <template v-if="role === 'master'">{{ product.master_price }} ₽</template>
        <template v-else>{{ product.user_price }} ₽</template>
      </div>
    </div>
    <!-- <button
      v-if="showFavorite"
      class="favorite-btn"
      :class="{active: isFavorite && isFavorite(product.id)}"
      @click.stop="handleFavorite"
    >
      <img src="@/assets/icons/favorite.svg" alt="Избранное" style="width:22px;height:22px;vertical-align:middle;" />
      <span v-if="isFavorite && isFavorite(product.id)">В избранном</span>
      <span v-else>В избранное</span>
    </button> -->
    <button class="favorite-btn" :class="{active: isFavorite(product.id)}" @click="handleFavorite">
      <img src="@/assets/icons/favorite.svg" alt="Избранное" style="width:22px;height:22px;vertical-align:middle;" />
      <!-- <span v-if="isFavorite(product.id)"></span> -->
      <!-- <span v-else></span> -->
    </button>
    <div v-if="showCart" class="cart-btns">
      <template v-if="isInCart">
        <button @click="decrement && decrement(cartItem)">-</button>
        <span style="margin:0 8px">{{ cartCount }}</span>
        <button @click="increment && increment(cartItem)" :disabled="cartCount >= product.quantity">+</button>
      </template>
      <template v-else>
        <button @click="addToCart && addToCart(product)">В корзину</button>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true },
    role: { type: String, required: false, default: () => localStorage.getItem('role') || 'user' },
    showCart: { type: Boolean, default: true },
    showFavorite: { type: Boolean, default: true },
    showPrice: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    showImage: { type: Boolean, default: true },
    cart: { type: Array, required: false, default: () => [] },
    increment: { type: Function, required: false },
    decrement: { type: Function, required: false },
    addToCart: { type: Function, required: false },
    favorites: { type: Array, required: false, default: () => [] },
    isFavorite: { type: Function, required: true },
    addToFavorites: { type: Function, required: false },
    removeFromFavorites: { type: Function, required: false }
  },
  computed: {
    cartItem() {
      return this.cart.find(item => (item.product_id || item.id) === this.product.id);
    },
    isInCart() {
      return !!this.cartItem;
    },
    cartCount() {
      return this.cartItem ? this.cartItem.quantity : 1;
    }
  },
  methods: {
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
    },
    goToProduct(id) {
      this.$router.push(`/product/${id}`);
    },
    handleFavorite() {
      if (!this.isFavorite || !this.addToFavorites || !this.removeFromFavorites) return;
      if (this.isFavorite(this.product.id)) {
        this.removeFromFavorites(this.product.id);
      } else {
        this.addToFavorites(this.product.id);
      }
    }
  }
}
</script>
