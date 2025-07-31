<template>
  <div>
    <AdminHeader />
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление категориями</h2>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in paginatedCategories" :key="category.id">
              <td>
                <img v-if="category.photos" :src="getFirstPhoto(category.photos)" class="rounded border" style="width:56px;height:56px;object-fit:cover;" alt="Фото" />
              </td>
              <td>{{ category.name }}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm d-inline-flex align-items-center px-2 py-1 me-1" style="min-width:32px;min-height:32px;" @click="openEditModal(category)" title="Редактировать">
                  <i class="bi bi-pencil"></i> <span class="ms-1">Редактировать</span>
                </button>
                <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center px-2 py-1" style="min-width:32px;min-height:32px;" @click="deleteCategory(category.id)" title="Удалить">
                  <i class="bi bi-trash"></i> <span class="ms-1">Удалить</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!paginatedCategories.length" class="text-center text-muted py-4">Нет категорий</div>
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
              <h5 class="modal-title">{{ editMode ? 'Редактировать категорию' : 'Добавить категорию' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <form @submit.prevent="submitCategory">
              <div class="modal-body">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label">Название*</label>
                    <input v-model="form.name" required maxlength="100" class="form-control" />
                  </div>
                  <div class="col-md-4">
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
  name: 'CategoryManagement',
  data() {
    return {
      categories: [],
      search: '',
      showModal: false,
      editMode: false,
      form: {
        id: null,
        name: '',
        photos: [],
        oldPhotos: '',
      },
      photoPreviews: [],
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    filteredCategories() {
      if (!this.search) return this.categories;
      return this.categories.filter(c => c.name.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedCategories() {
      const start = (this.page-1)*this.pageSize;
      return this.filteredCategories.slice(start, start+this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredCategories.length/this.pageSize)||1;
    }
  },
  methods: {
    async fetchCategories() {
      const res = await axios.get('/api/categories');
      this.categories = res.data;
    },
    getFirstPhoto(photos) {
      if (!photos) return '';
      let url = photos.split(',')[0];
      if (url && !url.startsWith('http')) {
        url = 'http://localhost:3000' + (url.startsWith('/') ? url : '/' + url);
      }
      return url;
    },
    openAddModal() {
      this.editMode = false;
      this.showModal = true;
      this.form = { id: null, name: '', photos: [], oldPhotos: '' };
      this.photoPreviews = [];
    },
    openEditModal(category) {
      this.editMode = true;
      this.showModal = true;
      this.form = { ...category, photos: [], oldPhotos: category.photos };
      this.photoPreviews = category.photos ? category.photos.split(',') : [];
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
    async submitCategory() {
      const formData = new FormData();
      formData.append('name', this.form.name);
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
          await axios.put(`/api/categories/${this.form.id}`, formData, { headers });
        } else {
          await axios.post('/api/categories', formData, { headers });
        }
        this.showModal = false;
        this.fetchCategories();
      } catch (e) {
        alert(e.response?.data?.error || 'Ошибка при сохранении категории');
      }
    },
    async deleteCategory(id) {
      if (!confirm('Удалить категорию?')) return;
      await axios.delete(`/api/categories/${id}`);
      this.fetchCategories();
    }
  },
  watch: {
    filteredCategories() {
      if (this.page > this.totalPages) this.page = this.totalPages;
    }
  },
  mounted() {
    this.fetchCategories();
  }
}
</script>

<style src="bootstrap/dist/css/bootstrap.min.css"></style>
