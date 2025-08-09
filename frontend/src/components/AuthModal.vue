<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal-dialog-centered auth-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isLogin ? 'Вход' : 'Регистрация' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form v-if="isLogin" @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="loginForm.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input v-model="loginForm.password" type="password" class="form-control" required />
            </div>
            <div v-if="loginError" class="text-danger small mb-2">{{ loginError }}</div>
            <button type="submit" class="btn btn-primary w-100">Войти</button>
          </form>
          <form v-else @submit.prevent="register">
            <div class="mb-3">
              <label class="form-label">Имя</label>
              <input v-model="registerForm.first_name" type="text" class="form-control" placeholder="Имя" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Фамилия</label>
              <input v-model="registerForm.last_name" type="text" class="form-control" placeholder="Фамилия" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Отчество</label>
              <input v-model="registerForm.patronymic" type="text" class="form-control" placeholder="Отчество" />
            </div>
            <div class="mb-3">
              <label class="form-label">Телефон</label>
              <input v-model="registerForm.phone" type="tel" class="form-control" placeholder="Телефон" required @input="onPhoneInput" maxlength="16" />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="registerForm.email" type="email" class="form-control" placeholder="Email" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input v-model="registerForm.password" type="password" class="form-control" placeholder="Пароль" required />
            </div>
            <div v-if="registerError" class="text-danger small mb-2">{{ registerError }}</div>
            <button type="submit" class="btn btn-primary w-100">Зарегистрироваться</button>
          </form>
        </div>
        <div class="modal-footer justify-content-center">
          <span v-if="isLogin">
            Нет аккаунта?
            <a href="#" @click.prevent="isLogin=false">Зарегистрироваться</a>
          </span>
          <span v-else>
            Есть аккаунт?
            <a href="#" @click.prevent="isLogin=true">Войти</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'AuthModal',
  props: {
    show: Boolean
  },
  data() {
    return {
      isLogin: true,
      loginForm: { email: '', password: '' },
      registerForm: {
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        password: ''
      },
      loginError: '',
      registerError: ''
    }
  },
  methods: {
    onPhoneInput(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.slice(0, 11);
      this.registerForm.phone = '+' + value;
    },
    async login() {
      this.loginError = '';
      try {
        const res = await axios.post('/api/login', this.loginForm);
        // Универсально: поддержка разных структур ответа
        const userId = res.data.userId || res.data.id;
        const firstName = res.data.first_name || res.data.firstName || '';
        const lastName = res.data.last_name || res.data.lastName || '';
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', (firstName + (lastName ? ' ' + lastName : '')).trim());
        localStorage.setItem('email', res.data.email);
        this.$emit('success');
        window.location.reload();
      } catch (e) {
        this.loginError = e.response?.data?.error || 'Ошибка входа';
      }
    },
    async register() {
      this.registerError = '';
      try {
        await axios.post('/api/register', this.registerForm);
        // После успешной регистрации сразу логинимся
        const loginData = { email: this.registerForm.email, password: this.registerForm.password };
        await this.loginWithData(loginData);
      } catch (e) {
        this.registerError = e.response?.data?.error || 'Ошибка регистрации';
      }
    },
    async loginWithData(data) {
      // Логин с передачей данных (используется после регистрации)
      this.loginError = '';
      try {
        const res = await axios.post('/api/login', data);
        const userId = res.data.userId || res.data.id;
        const firstName = res.data.first_name || res.data.firstName || '';
        const lastName = res.data.last_name || res.data.lastName || '';
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', (firstName + (lastName ? ' ' + lastName : '')).trim());
        localStorage.setItem('email', res.data.email);
        this.$emit('success');
        window.location.reload();
      } catch (e) {
        this.loginError = e.response?.data?.error || 'Ошибка входа';
      }
    }
  }
}
</script>
