<template>
  <div>
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление заказами</h2>
        <!-- Можно добавить кнопку для ручного создания заказа, если нужно -->
      </div>
      <div class="mb-3 row g-2 align-items-center">
        <div class="col-md-6 col-12 mb-2 mb-md-0">
          <input v-model="search" class="form-control" placeholder="Поиск по номеру, имени, телефону, email..." />
        </div>
        <div class="col-md-3 col-6 mb-2 mb-md-0">
          <select v-model="statusFilter" class="form-select">
            <option value="">Все статусы</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="col-md-3 col-6 text-md-end text-center">
          <!-- Можно добавить фильтр по типу заказа -->
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Пользователь</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th v-if="orders.some(o => o.order_type === 'Доставка')">Адрес</th>
              <th class="text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ formatDateNoSec(order.created_at || order.order_date) }}</td>
              <td>
                <select v-model="order.status" @change="updateStatus(order)" class="form-select form-select-sm">
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td>
                <template v-if="order.first_name || order.last_name">
                  {{ [order.last_name, order.first_name, order.patronymic].filter(Boolean).join(' ') }}
                </template>
                <template v-else>
                  {{ order.name || '-' }}
                </template>
              </td>
              <td>{{ order.user_phone || order.phone || '-' }}</td>
              <td>{{ order.user_email || order.email || '-' }}</td>
              <td>{{ order.total_price }} ₽</td>
              <td>{{ order.order_type }}</td>
              <td v-if="orders.some(o => o.order_type === 'Доставка')">
                <template v-if="order.order_type === 'Доставка'">
                  {{ order.address || order.delivery_address || '-' }}
                </template>
              </td>
              <td class="text-center">
                <button class="btn btn-outline-info btn-sm me-1" @click="openOrderModal(order)">
                  <i class="bi bi-eye"></i> <span class="ms-1">Товары</span>
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteOrder(order.id)">
                  <i class="bi bi-trash"></i> <span class="ms-1">Удалить</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!paginatedOrders.length" class="text-center text-muted py-4">Нет заказов</div>
      </div>
      <nav v-if="totalPages > 1" class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{disabled: page===1}">
            <button class="page-link" @click="page--" :disabled="page===1">&lt;</button>
          </li>
          <li class="page-item disabled"><span class="page-link">Стр. {{page}} из {{totalPages}}</span></li>
          <li class="page-item" :class="{disabled: page===totalPages}">
            <button class="page-link" @click="page++" :disabled="page===totalPages">&gt;</button>
          </li>
        </ul>
      </nav>

      <!-- Модалка для просмотра товаров заказа -->
      <div class="modal fade show" tabindex="-1" style="display:block; background:rgba(0,0,0,0.18);" v-if="showModal">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Товары заказа №{{ selectedOrder?.id }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedOrder && selectedOrder.items && selectedOrder.items.length">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Кол-во</th>
                      <th>Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedOrder.items" :key="item.id">
                      <td>
                        <template v-if="selectedOrder.productsMap && selectedOrder.productsMap[item.product_id]">
                          <a :href="'/product/' + item.product_id" target="_blank" style="text-decoration:none; color:inherit;">
                            <img :src="getProductPhoto(selectedOrder.productsMap[item.product_id])" alt="фото" style="width:40px; height:40px; object-fit:cover; margin-right:8px; border-radius:4px; vertical-align:middle;">
                            <span style="vertical-align:middle; text-decoration:underline;">{{ selectedOrder.productsMap[item.product_id].name }}</span>
                          </a>
                        </template>
                        <template v-else>
                          {{ item.product_id }}
                        </template>
                      </td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.price }} ₽</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-muted">Нет товаров в заказе</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
// ...existing code...
import dayjs from 'dayjs';
import axios from 'axios';

export default {
  name: 'OrderManagement',
  data() {
    return {
      orders: [],
      search: '',
      statusFilter: '',
      statuses: ['В обработке', 'Принят', 'Ожидает оплаты', 'Оплачен', 'В пути', 'Ожидает получения', 'Отменен', 'Завершен'],
      page: 1,
      pageSize: 10,
      showModal: false,
      selectedOrder: null,
    };
  },
  computed: {
    filteredOrders() {
      let res = this.orders;
      if (this.search) {
        const s = this.search.toLowerCase();
        res = res.filter(o =>
          String(o.id).includes(s) ||
          (o.name && o.name.toLowerCase().includes(s)) ||
          (o.phone && o.phone.includes(s)) ||
          (o.email && o.email.toLowerCase().includes(s))
        );
      }
      if (this.statusFilter) {
        res = res.filter(o => o.status === this.statusFilter);
      }
      return res;
    },
    paginatedOrders() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredOrders.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
    }
  },
  methods: {
    async fetchOrders() {
      const res = await axios.get('/api/orders/all');
      this.orders = res.data;
    },
    formatDateNoSec(date) {
      if (!date) return '';
      return dayjs(date).format('DD.MM.YYYY HH:mm');
    },
    openOrderModal(order) {
      // Загружаем данные о товарах заказа
      const productIds = order.items.map(item => item.product_id);
      let productsMap = {};
      if (productIds.length) {
        axios.post('/api/products/by-ids', { ids: productIds }).then(res => {
          for (const p of res.data) {
            productsMap[p.id] = p;
          }
          this.selectedOrder = { ...order, productsMap };
          this.showModal = true;
        });
      } else {
        this.selectedOrder = { ...order, productsMap };
        this.showModal = true;
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedOrder = null;
    },
    async updateStatus(order) {
      await axios.put(`/api/orders/${order.id}/status`, { status: order.status });
      await this.fetchOrders();
      // Можно добавить уведомление об успехе
    },
    async deleteOrder(id) {
      if (!confirm('Удалить заказ?')) return;
      await axios.delete(`/api/orders/${id}`);
      this.orders = this.orders.filter(o => o.id !== id);
    },
    getProductPhoto(product) {
      if (!product || !product.photos) return '/logosq.png';
      const photo = product.photos.split(',')[0];
      if (!photo) return '/logosq.png';
      if (photo.startsWith('http')) return photo;
      if (photo.startsWith('/uploads/products/')) return 'http://localhost:3000' + photo;
      return photo;
    }
  },
  mounted() {
    this.fetchOrders();
  }
};
</script>

<style src="bootstrap/dist/css/bootstrap.min.css"></style>
