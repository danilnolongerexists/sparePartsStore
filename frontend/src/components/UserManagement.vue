<template>
  <div class="container py-4">
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-outline-secondary" @click="logout">Выйти</button>
    </div>
    <h2 class="mb-4 text-center">Управление пользователями</h2>
    <div class="row mb-3 align-items-center g-2">
      <div class="col-md-6 col-12 mb-2 mb-md-0">
        <input type="text" v-model="search" class="form-control" placeholder="Поиск по ФИО, телефону или email..." />
      </div>
      <div class="col-md-4 col-8 mb-2 mb-md-0">
        <div class="d-flex flex-wrap gap-2">
          <label v-for="role in roles" :key="role" class="form-check-label me-2">
            <input type="checkbox" class="form-check-input me-1" :value="role" v-model="selectedRoles" />
            {{ role }}
          </label>
        </div>
      </div>
      <div class="col-md-2 col-4 text-md-end text-center">
        <button class="btn btn-primary w-100 w-md-auto" @click="openAddModal">Добавить пользователя</button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Отчество</th>
            <th>Роль</th>
            <th>Телефон</th>
            <th>Email</th>
            <th class="text-center">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.patronymic }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.email }}</td>
            <td class="text-center">
              <button class="btn btn-warning btn-sm me-2" @click="openEditModal(user)">Редактировать</button>
              <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно для добавления/редактирования -->
    <div v-if="showModal">
      <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.3);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title w-100 text-center">{{ isEdit ? 'Редактировать пользователя' : 'Добавить пользователя' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="isEdit ? updateUser() : addUser()">
                <div class="row g-2">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Имя</label>
                    <input v-model="form.first_name" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Фамилия</label>
                    <input v-model="form.last_name" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Отчество</label>
                    <input v-model="form.patronymic" type="text" class="form-control" />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Роль</label>
                    <select v-model="form.role" class="form-select" required>
                      <option value="admin">admin</option>
                      <option value="master">master</option>
                      <option value="user">user</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Телефон</label>
                    <input v-model="form.phone" type="tel" class="form-control" required @input="onPhoneInput" maxlength="12" />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email</label>
                    <input v-model="form.email" type="email" class="form-control" required />
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Пароль <span v-if="isEdit" class="text-muted">(оставьте пустым, чтобы не менять)</span></label>
                    <input v-model="form.password" type="password" class="form-control" :required="!isEdit" />
                  </div>
                </div>
                <div class="d-flex justify-content-center gap-2 mt-2">
                  <button type="submit" class="btn btn-success">Сохранить</button>
                  <button type="button" class="btn btn-secondary ms-2" @click="closeModal">Отмена</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      showModal: false,
      isEdit: false,
      search: '',
      roles: ['admin', 'master', 'user'],
      selectedRoles: ['admin', 'master', 'user'],
      form: {
        id: null,
        first_name: '',
        last_name: '',
        patronymic: '',
        role: 'user',
        phone: '',
        email: '',
        password: ''
      }
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  computed: {
    filteredUsers() {
      let filtered = this.users;
      if (this.selectedRoles.length > 0 && this.selectedRoles.length < this.roles.length) {
        filtered = filtered.filter(u => this.selectedRoles.includes(u.role));
      }
      if (this.search) {
        const s = this.search.toLowerCase();
        filtered = filtered.filter(u =>
          (`${u.last_name} ${u.first_name} ${u.patronymic}`.toLowerCase().includes(s) ||
           `${u.first_name} ${u.last_name} ${u.patronymic}`.toLowerCase().includes(s) ||
           (u.phone && u.phone.toLowerCase().includes(s)) ||
           (u.email && u.email.toLowerCase().includes(s))
          )
        );
      }
      return filtered;
    }
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      axios.get('/api/users', { headers: { 'x-user-role': 'admin' } })
        .then(res => { this.users = res.data; })
        .catch(() => { this.users = []; });
    },
    openAddModal() {
      this.isEdit = false;
      this.form = { id: null, first_name: '', last_name: '', patronymic: '', role: 'user', phone: '', email: '', password: '' };
      this.showModal = true;
    },
    openEditModal(user) {
      this.isEdit = true;
      this.form = { ...user, password: '' };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addUser() {
      axios.post('/api/users', this.form, { headers: { 'x-user-role': 'admin' } })
        .then(() => { this.fetchUsers(); this.closeModal(); this.toast.success('Пользователь успешно добавлен!'); })
        .catch(() => { this.toast.error('Ошибка при добавлении пользователя.'); });
    },
    updateUser() {
      axios.put(`/api/users/${this.form.id}`, this.form, { headers: { 'x-user-role': 'admin' } })
        .then(() => { this.fetchUsers(); this.closeModal(); this.toast.success('Пользователь успешно обновлён!'); })
        .catch(() => { this.toast.error('Ошибка при обновлении пользователя.'); });
    },
    deleteUser(id) {
      if (confirm('Удалить пользователя?')) {
        axios.delete(`/api/users/${id}`, { headers: { 'x-user-role': 'admin' } })
          .then(() => { this.fetchUsers(); this.toast.success('Пользователь удалён!'); })
          .catch(() => { this.toast.error('Ошибка при удалении пользователя.'); });
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    onPhoneInput(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.slice(0, 11);
      this.form.phone = '+' + value;
    }
  }
};
</script>

<style scoped>
/**** Bootstrap используется, поэтому кастомные стили минимальны ****/
.add-btn {
  margin-bottom: 18px;
}
.action-btn {
  margin: 0 2px;
}
</style>
