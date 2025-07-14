<template>
  <div class="profile-modal-bg" @click.self="close">
    <div class="profile-modal">
      <h3>Личный кабинет</h3>
      <form @submit.prevent="save">
        <div class="form-group">
          <label>Имя</label>
          <input v-model="form.first_name" type="text" required />
        </div>
        <div class="form-group">
          <label>Фамилия</label>
          <input v-model="form.last_name" type="text" required />
        </div>
        <div class="form-group">
          <label>Отчество</label>
          <input v-model="form.patronymic" type="text" />
        </div>
        <div class="form-group">
          <label>Телефон</label>
          <input v-model="form.phone" type="tel" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Пароль <span class="text-muted">(оставьте пустым, чтобы не менять)</span></label>
          <input v-model="form.password" type="password" />
        </div>
        <div class="profile-actions">
          <button type="submit">Сохранить</button>
          <button type="button" @click="logout">Выйти</button>
          <button type="button" @click="close">Закрыть</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ProfileModal',
  props: ['user', 'show'],
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        password: ''
      }
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            first_name: val.first_name || '',
            last_name: val.last_name || '',
            patronymic: val.patronymic || '',
            phone: val.phone || '',
            email: val.email || '',
            password: ''
          };
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    async save() {
      try {
        const id = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        await axios.put(`/api/users/${id}`, this.form, {
          headers: { 'x-user-role': localStorage.getItem('role'), Authorization: token }
        });
        this.$emit('saved');
        this.close();
      } catch (e) {
        alert('Ошибка при сохранении');
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.profile-modal-bg {
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-modal {
  background: #fff;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.profile-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}
.profile-actions button {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 4px;
  background: #2d3e50;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.profile-actions button:hover {
  background: #1a2533;
}
</style>
