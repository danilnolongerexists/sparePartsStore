<template>
  <div class="profile-page-standalone">
    <div class="profile-header">
      <h2>Личный кабинет</h2>
      <button class="profile-logout" @click="logout">Выйти</button>
    </div>
    <div class="profile-content">
      <form class="profile-form" @submit.prevent="save">
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
          <button type="button" @click="goBack">Назад</button>
        </div>
        <div v-if="error" class="profile-error">{{ error }}</div>
        <div v-if="loading" class="profile-loader">Загрузка...</div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ProfilePage',
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        password: ''
      },
      loading: true,
      error: ''
    }
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
    async getUserId() {
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
        alert('Данные успешно сохранены!');
      } catch (e) {
        this.error = e?.response?.data?.error || 'Ошибка при сохранении';
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      this.$router.push('/');
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
  }
}
</script>
