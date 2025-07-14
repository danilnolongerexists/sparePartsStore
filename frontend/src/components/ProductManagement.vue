<template>
  <div>
    <AdminHeader />
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление товарами</h2>
        <button class="btn btn-primary" @click="openAddModal">+ Добавить</button>
      </div>
      <div class="mb-3">
        <input v-model="search" class="form-control" placeholder="Поиск по названию..." />
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Фото</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена (пользователь)</th>
              <th>Цена (мастер)</th>
              <th>Кол-во</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td>
                <img v-if="product.photos" :src="getFirstPhoto(product.photos)" class="rounded border" style="width:56px;height:56px;object-fit:cover;" alt="Фото" />
              </td>
              <td>{{ product.name }}</td>
              <td>{{ getCategoryName(product.category_id) }}</td>
              <td>{{ product.user_price }}</td>
              <td>{{ product.master_price }}</td>
              <td>{{ product.quantity }}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm d-inline-flex align-items-center px-2 py-1 me-1" style="min-width:32px;min-height:32px;" @click="openEditModal(product)" title="Редактировать">
                  <i class="bi bi-pencil"></i> <span class="ms-1">Редактировать</span>
                </button>
                <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center px-2 py-1" style="min-width:32px;min-height:32px;" @click="deleteProduct(product.id)" title="Удалить">
                  <i class="bi bi-trash"></i> <span class="ms-1">Удалить</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!paginatedProducts.length" class="text-center text-muted py-4">Нет товаров</div>
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

      <!-- Модалка -->
      <div class="modal fade show" tabindex="-1" style="display:block; background:rgba(0,0,0,0.18);" v-if="showModal">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? 'Редактировать товар' : 'Добавить товар' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <form @submit.prevent="submitProduct">
              <div class="modal-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Название*</label>
                    <input v-model="form.name" required maxlength="100" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Категория</label>
                    <select v-model="form.category_id" class="form-select">
                      <option :value="null">Без категории</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Описание</label>
                    <textarea v-model="form.description" rows="2" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Цена для пользователя*</label>
                    <input v-model.number="form.user_price" type="number" min="0" step="0.01" required class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Цена для мастера*</label>
                    <input v-model.number="form.master_price" type="number" min="0" step="0.01" required class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Количество*</label>
                    <input v-model.number="form.quantity" type="number" min="0" required class="form-control" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Фотографии</label>
                    <input ref="fileInput" type="file" multiple accept="image/*" @change="onPhotoChange" class="form-control mb-2" />
                    <div class="d-flex flex-wrap gap-2">
                      <div v-for="(photo, idx) in photoPreviews" :key="idx" class="position-relative">
                        <img :src="photo" alt="Фото" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #dee2e6;" />
                        <button type="button" class="btn-close position-absolute top-0 end-0 bg-white" style="transform:scale(0.7);" @click="removePhoto(idx)"></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Сохранить</button>
                <button type="button" class="btn btn-secondary" @click="closeModal">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div v-if="showModal" class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ProductManagement',
  data() {
    return {
      products: [],
      categories: [],
      search: '',
      showModal: false,
      editMode: false,
      form: {
        id: null,
        name: '',
        category_id: null,
        description: '',
        user_price: '',
        master_price: '',
        quantity: '',
        photos: [],
        oldPhotos: '',
      },
      photoPreviews: [],
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    filteredProducts() {
      if (!this.search) return this.products;
      return this.products.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedProducts() {
      const start = (this.page-1)*this.pageSize;
      return this.filteredProducts.slice(start, start+this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length/this.pageSize)||1;
    }
  },
  methods: {
    async fetchProducts() {
      const res = await axios.get('/api/products');
      this.products = res.data;
    },
    async fetchCategories() {
      const res = await axios.get('/api/categories');
      this.categories = res.data;
    },
    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id);
      return cat ? cat.name : '';
    },
    getFirstPhoto(photos) {
      return photos ? photos.split(',')[0] : '';
    },
    openAddModal() {
      this.editMode = false;
      this.showModal = true;
      this.form = { id: null, name: '', category_id: null, description: '', user_price: '', master_price: '', quantity: '', photos: [], oldPhotos: '' };
      this.photoPreviews = [];
    },
    openEditModal(product) {
      this.editMode = true;
      this.showModal = true;
      this.form = { ...product, photos: [], oldPhotos: product.photos };
      this.photoPreviews = product.photos ? product.photos.split(',') : [];
    },
    closeModal() {
      this.showModal = false;
    },
    onPhotoChange(e) {
      const files = Array.from(e.target.files);
      this.form.photos = files;
      this.photoPreviews = files.map(f => URL.createObjectURL(f));
    },
    removePhoto(idx) {
      this.photoPreviews.splice(idx, 1);
      if (this.editMode && this.form.oldPhotos) {
        const arr = this.form.oldPhotos.split(',');
        arr.splice(idx, 1);
        this.form.oldPhotos = arr.join(',');
      } else {
        this.form.photos.splice(idx, 1);
      }
    },
    async submitProduct() {
      const formData = new FormData();
      formData.append('name', this.form.name);
      formData.append('category_id', this.form.category_id || '');
      formData.append('description', this.form.description);
      formData.append('user_price', this.form.user_price);
      formData.append('master_price', this.form.master_price);
      formData.append('quantity', this.form.quantity);
      if (this.editMode) formData.append('photos', this.form.oldPhotos);
      if (this.form.photos && this.form.photos.length) {
        this.form.photos.forEach(f => formData.append('photos', f));
      }
      try {
        const headers = {
          'Content-Type': 'multipart/form-data',
          'x-user-role': localStorage.getItem('role') || 'user'
        };
        if (this.editMode) {
          await axios.put(`/api/products/${this.form.id}`, formData, { headers });
        } else {
          await axios.post('/api/products', formData, { headers });
        }
        this.showModal = false;
        this.fetchProducts();
      } catch (e) {
        alert(e.response?.data?.error || 'Ошибка при сохранении товара');
      }
    },
    async deleteProduct(id) {
      if (!confirm('Удалить товар?')) return;
      await axios.delete(`/api/products/${id}`);
      this.fetchProducts();
    }
  },
  watch: {
    filteredProducts() {
      if (this.page > this.totalPages) this.page = this.totalPages;
    }
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  }
}
</script>

<!-- Bootstrap используется, поэтому кастомные стили не нужны -->
