<template>
  <div class="profile-page-standalone">
    <div class="profile-header">
      <h2>Личный кабинет</h2>
      <button class="profile-logout" @click="logout">Выйти</button>
    </div>
    <div class="profile-tabs">
      <button :class="{active: tab==='profile'}" @click="tab='profile'">Профиль</button>
      <button :class="{active: tab==='orders'}" @click="onOrdersTabClick">Заказы</button>
    </div>
    <div class="profile-content">
      <form v-if="tab==='profile'" class="profile-form" @submit.prevent="save">
        <div class="profile-row">
          <div class="profile-col">
            <label>Имя</label>
            <input v-model="form.first_name" type="text" required autocomplete="given-name" />
          </div>
          <div class="profile-col">
            <label>Фамилия</label>
            <input v-model="form.last_name" type="text" required autocomplete="family-name" />
          </div>
        </div>
        <div class="profile-row">
          <div class="profile-col">
            <label>Отчество</label>
            <input v-model="form.patronymic" type="text" autocomplete="additional-name" />
          </div>
          <div class="profile-col">
            <label>Телефон</label>
            <input v-model="form.phone" type="tel" required autocomplete="tel" @input="onPhoneInput" maxlength="12" />
          </div>
        </div>
        <div class="profile-row">
          <div class="profile-col">
            <label>Email</label>
            <input v-model="form.email" type="email" required autocomplete="email" />
          </div>
          <div class="profile-col">
            <label>Пароль <span class="text-muted">(оставьте пустым, чтобы не менять)</span></label>
            <input v-model="form.password" type="password" autocomplete="new-password" />
          </div>
        </div>
        <div class="profile-actions">
          <button type="submit">Сохранить</button>
        </div>
        <div v-if="error" class="profile-error">{{ error }}</div>
        <div v-if="loading" class="profile-loader">Загрузка...</div>
      </form>
      <div v-else-if="tab==='orders'" class="orders-tab">
        <div v-if="ordersLoading">Загрузка заказов...</div>
        <div v-else-if="!Array.isArray(orders) || orders.length === 0">У вас пока нет заказов.</div>
        <div v-else>
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <b>Заказ №{{ order.id }}</b> — {{ order.status }}<br/>
              <span class="order-date">{{ formatDateNoSec(order.order_date) }}</span>
              <br>
              <span class="order-sum">Сумма: {{ order.total_price }} ₽</span>
            </div>
            <div v-for="item in order.items" :key="item.id" class="order-item order-item-with-img">
              <template v-if="orderProducts[item.product_id]">
                <router-link :to="'/product/' + item.product_id" class="order-item-img-link">
                  <img :src="getFirstPhoto(orderProducts[item.product_id].photos)" alt="" class="order-item-img" />
                </router-link>
                <div class="order-item-info">
                  <router-link :to="'/product/' + item.product_id" class="order-item-title">
                    {{ orderProducts[item.product_id].name }}
                  </router-link>
                  <div>Кол-во: {{ item.quantity }}</div>
                  <div>Цена: {{ item.price }} ₽</div>
                </div>
              </template>
              <template v-else>
                <span>Товар: {{ item.product_id }}</span>
                <span>Кол-во: {{ item.quantity }}</span>
                <span>Цена: {{ item.price }} ₽</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'ProfilePage',
  data() {
    return {
      tab: 'profile',
      orders: [],
      ordersLoading: false,
      form: {
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        password: ''
      },
      loading: true,
      error: '',
      toast: null,
      orderProducts: {}
    }
  },
  watch: {
    tab(val) {
      console.log('tab changed:', val);
      if (val === 'orders') this.fetchOrders();
    }
  },
  created() {
    this.toast = useToast();
  },
  async mounted() {
    try {
      const id = await this.getUserId();
      if (!id) {
        this.error = 'Ошибка загрузки данных пользователя. Пожалуйста, перезайдите в аккаунт.';
        this.loading = false;
        return;
      }
      const res = await axios.get(`/api/user/${id}`);
      const user = res.data;
      this.form = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        patronymic: user.patronymic || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        role: user.role || localStorage.getItem('role') || 'user'
      };
      this.loading = false;
    } catch (e) {
      this.error = 'Ошибка загрузки данных пользователя';
      this.loading = false;
    }
  },
  methods: {
    formatDateNoSec(date) {
      if (!date) return '';
      return dayjs(date).format('DD.MM.YYYY HH:mm');
    },
    onOrdersTabClick() {
      // console.log('Клик по вкладке Заказы');
      this.tab = 'orders';
    },
    async fetchOrders() {
      console.log('fetchOrders called');
      this.ordersLoading = true;
      try {
        const userId = await this.getUserId();
        // console.log('userId for orders:', userId);
        if (!userId) throw new Error('Нет userId');
        const res = await axios.get(`/api/orders?user_id=${userId}`);
        // console.log('orders response:', res.data);
        this.orders = res.data;
        // Собираем все product_id из всех заказов
        const allProductIds = Array.from(new Set(
          this.orders.flatMap(order => order.items.map(item => item.product_id))
        ));
        if (allProductIds.length) {
          const prodRes = await axios.post('/api/products/by-ids', { ids: allProductIds });
          this.orderProducts = {};
          for (const p of prodRes.data) {
            this.orderProducts[p.id] = p;
          }
        } else {
          this.orderProducts = {};
        }
      } catch (e) {
        console.log('fetchOrders error:', e);
        this.orders = [];
      } finally {
        this.ordersLoading = false;
      }
    },
    formatDate(date) {
      if (!date) return '';
      return dayjs(date).format('DD.MM.YYYY HH:mm');
    },
    async getUserId() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id) return user.id;
        } catch (e) {}
      }
      let id = localStorage.getItem('userId');
      if (id) return id;
      const email = localStorage.getItem('email');
      if (!email) return null;
      try {
        const res = await axios.get(`/api/user-by-email/${encodeURIComponent(email)}`);
        if (res.data && res.data.id) {
          localStorage.setItem('userId', res.data.id);
          return res.data.id;
        }
      } catch (e) {
        return null;
      }
      return null;
    },
    async save() {
      try {
        const id = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('role') === 'admin';
        const data = { ...this.form };
        if (!isAdmin) delete data.role;
        const url = isAdmin ? `/api/users/${id}` : `/api/profile/${id}`;
        await axios.put(url, data, {
          headers: { 'x-user-role': localStorage.getItem('role'), Authorization: token }
        });
        this.toast.success('Данные успешно сохранены!', {
          position: 'bottom-center',
          hideProgressBar: true,
          closeButton: false,
          draggable: false,
          pauseOnHover: true
        });
      } catch (e) {
        this.error = e?.response?.data?.error || 'Ошибка при сохранении';
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('email');
      window.location.href = '/';
    },
    goBack() {
      this.$router.push('/');
    },
    onPhoneInput(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.slice(0, 11);
      this.form.phone = '+' + value;
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
    },
  }
}
</script>

<style scoped>
.order-item-with-img {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 14px;
}
.order-item-img-link {
  display: block;
  min-width: 64px;
  max-width: 80px;
}
.order-item-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  background: #fff;
  transition: box-shadow 0.2s;
}
.order-item-img-link:hover .order-item-img {
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
}
.order-item-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.order-item-title {
  font-weight: 500;
  color: #1976d2;
  text-decoration: none;
  margin-bottom: 2px;
  transition: color 0.2s;
}
.order-item-title:hover {
  color: #0d47a1;
  text-decoration: underline;
}
.order-item-info > div {
  font-size: 0.98em;
  color: #444;
  margin-bottom: 2px;
}
</style>
