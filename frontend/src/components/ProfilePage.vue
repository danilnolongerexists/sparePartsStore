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
      localStorage.clear();
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

<style scoped>
.profile-page-standalone {
  min-height: 100vh;
  background: linear-gradient(120deg, #f7f7fa 60%, #e3e9f7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem 2rem 1rem;
}
.profile-header {
  width: 100%;
  max-width: 540px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2.5rem auto 1.5rem auto;
}
.profile-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #2d3e50;
}
.profile-logout {
  background: #fff;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  border-radius: 4px;
  padding: 0.45rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.profile-logout:hover {
  background: #d32f2f;
  color: #fff;
}
.profile-content {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.profile-form {
  width: 100%;
}
.profile-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.1rem;
}
.profile-col {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
}
.profile-col label {
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #2d3e50;
}
.profile-col input {
  padding: 0.55rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  background: #f8fafc;
  font-size: 1rem;
  transition: border 0.2s;
}
.profile-col input:focus {
  border: 1.5px solid #6c8cff;
  outline: none;
  background: #fff;
}
.profile-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.2rem;
  justify-content: flex-end;
}
.profile-actions button {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 4px;
  background: #2d3e50;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
}
.profile-actions button:hover {
  background: #1a2533;
}
.profile-loader {
  text-align: center;
  color: #6c8cff;
  font-size: 1.1rem;
  margin: 2rem 0;
}
.profile-error {
  color: #d32f2f;
  text-align: center;
  margin-top: 1rem;
}
@media (max-width: 700px) {
  .profile-content, .profile-header {
    max-width: 100%;
  }
  .profile-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
