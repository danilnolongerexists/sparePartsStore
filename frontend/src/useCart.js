import { ref } from 'vue';
import axios from 'axios';

export function useCart() {
  const cart = ref([]);
  const loading = ref(false);

  async function fetchCart() {
    loading.value = true;
    const userId = localStorage.getItem('userId');
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
    const userId = localStorage.getItem('userId');
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
    const userId = localStorage.getItem('userId');
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

  async function addToCart(product) {
    const userId = localStorage.getItem('userId');
    try {
      await axios.post('http://localhost:3000/api/cart', {
        user_id: userId,
        product_id: product.id,
        quantity: 1
      });
      await fetchCart();
    } catch {}
  }

  return {
    cart,
    loading,
    fetchCart,
    increment,
    decrement,
    addToCart
  };
}
