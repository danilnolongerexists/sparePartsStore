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
      <form @submit.prevent="submitOrder" class="order-form" style="margin-top:2rem;">
        <h2>Оформление заказа</h2>
        <div>
          <label>Тип заказа:</label>
          <select v-model="orderType">
            <option value="Самовывоз">Самовывоз</option>
            <option value="Доставка">Доставка</option>
          </select>
        </div>
        <div v-if="!isAuth">
          <div>
            <label>Имя:</label>
            <input v-model="orderName" required />
          </div>
          <div>
            <label>Телефон:</label>
            <input v-model="orderPhone" required />
          </div>
          <div>
            <label>Email:</label>
            <input v-model="orderEmail" type="email" />
          </div>
        </div>
        <div v-if="orderType === 'Доставка'">
          <div>
            <label>Адрес доставки:</label>
            <input v-model="orderAddress" required />
          </div>
        </div>
        <button type="submit">Оформить заказ</button>
        <div v-if="orderError" class="text-danger" style="margin-top:1rem;">{{ orderError }}</div>
        <div v-if="orderSuccess" class="text-success" style="margin-top:1rem;">Заказ успешно оформлен!</div>
      </form>
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

const isAuth = computed(() => !!localStorage.getItem('token'));
const orderType = ref('Самовывоз');
const orderName = ref('');
const orderPhone = ref('');
const orderEmail = ref('');
const orderAddress = ref('');
const orderError = ref('');
const orderSuccess = ref(false);

async function submitOrder() {
  orderError.value = '';
  orderSuccess.value = false;
  if (cart.value.length === 0) {
    orderError.value = 'Корзина пуста';
    return;
  }
  try {
    const payload = {
      user_id: isAuth.value ? userId : null,
      name: isAuth.value ? null : orderName.value,
      phone: isAuth.value ? null : orderPhone.value,
      email: isAuth.value ? null : orderEmail.value,
      status: 'В обработке',
      total_price: totalPrice.value,
      order_type: orderType.value,
      address: orderType.value === 'Доставка' ? orderAddress.value : null,
      items: cart.value.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };
    await axios.post('http://localhost:3000/api/orders', payload);
    orderSuccess.value = true;
    // Можно очистить корзину или обновить её
    await fetchCart();
  } catch (e) {
    orderError.value = 'Ошибка оформления заказа';
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
.order-form { background: #f9f9f9; border-radius: 8px; padding: 1rem; margin-top: 1.5rem; }
.order-form h2 { margin-top: 0; }
.order-form div { margin-bottom: 1rem; }
.order-form label { display: block; margin-bottom: 0.5rem; }
.order-form input, .order-form select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.order-form button { background: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
.order-form button:disabled { background: #ccc; }
.text-danger { color: red; }
.text-success { color: green; }
</style>
