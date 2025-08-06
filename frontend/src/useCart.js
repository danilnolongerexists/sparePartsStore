
import { ref } from 'vue';
import axios from 'axios';

export function useCart() {
  const cart = ref([]);
  const loading = ref(false);
  const detailedCart = ref([]);

  function fetchCart() {
    loading.value = true;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Гость: корзина из localStorage
      try {
        // Храним только id и quantity
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.value = localCart.map(i => ({ id: i.id, quantity: i.quantity }));
      } catch {
        cart.value = [];
      }
      loading.value = false;
      return;
    }
    // Авторизованный: корзина с backend
    axios.get(`http://localhost:3000/api/cart/${userId}`)
      .then(({ data }) => { cart.value = data; })
      .catch(() => { cart.value = []; })
      .finally(() => { loading.value = false; });
  }

  async function loadDetailedCart() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      detailedCart.value = cart.value;
      console.log('detailedCart (auth):', detailedCart.value);
      return;
    }
    if (!cart.value.length) {
      detailedCart.value = [];
      console.log('detailedCart (guest, empty):', detailedCart.value);
      return;
    }
    try {
      const ids = cart.value.map(i => i.id);
      const { data } = await axios.post('http://localhost:3000/api/products/by-ids', { ids });
      detailedCart.value = ids.map(id => {
        const prod = data.find(p => p.id === id);
        const qty = cart.value.find(i => i.id === id)?.quantity || 1;
        return prod ? { ...prod, quantity: qty } : null;
      }).filter(Boolean);
      console.log('cart.value:', cart.value);
      console.log('detailedCart (guest):', detailedCart.value);
    } catch (e) {
      detailedCart.value = [];
      console.log('detailedCart (guest, error):', e);
    }
  }

  function increment(item) {
    const userId = localStorage.getItem('userId');
    if (item.quantity >= (item.product_quantity || 99)) return;
    if (!userId) {
      // Гость: обновляем localStorage
      let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      localCart = localCart.map(i =>
        (i.id === (item.product_id || item.id)) ? { ...i, quantity: i.quantity + 1 } : i
      );
      localStorage.setItem('cart', JSON.stringify(localCart));
      fetchCart();
      loadDetailedCart();
      return;
    }
    // Авторизованный: backend
    axios.post('http://localhost:3000/api/cart', {
      user_id: userId,
      product_id: item.product_id || item.id,
      quantity: item.quantity + 1
    })
      .then(fetchCart)
      .catch(() => {});
  }

  function decrement(item) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Гость: обновляем localStorage
      let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (item.quantity > 1) {
        localCart = localCart.map(i =>
          (i.id === (item.product_id || item.id)) ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        localCart = localCart.filter(i => i.id !== (item.product_id || item.id));
      }
      localStorage.setItem('cart', JSON.stringify(localCart));
      fetchCart();
      loadDetailedCart();
      return;
    }
    // Авторизованный: backend
    if (item.quantity > 1) {
      axios.post('http://localhost:3000/api/cart', {
        user_id: userId,
        product_id: item.product_id || item.id,
        quantity: item.quantity - 1
      })
        .then(fetchCart)
        .catch(() => {});
    } else if (item.quantity === 1) {
      axios.delete('http://localhost:3000/api/cart', {
        params: { user_id: userId, product_id: item.product_id || item.id }
      })
        .then(fetchCart)
        .catch(() => {});
    }
  }

  function addToCart(product) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Гость: добавляем в localStorage
      let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = localCart.findIndex(i => i.id === product.id);
      if (idx !== -1) {
        // Уже есть — увеличиваем количество
        localCart[idx].quantity += 1;
      } else {
        // Новый товар — только id и quantity
        localCart.push({ id: product.id, quantity: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(localCart));
      fetchCart();
      loadDetailedCart();
      return;
    }
    // Авторизованный: backend
    axios.post('http://localhost:3000/api/cart', {
      user_id: userId,
      product_id: product.id,
      quantity: 1
    })
      .then(fetchCart)
      .catch(() => {});
  }

  return {
    cart,
    loading,
    fetchCart,
    increment,
    decrement,
    addToCart,
    detailedCart,
    loadDetailedCart
  };
}
