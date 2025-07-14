<template>
  <div class="auth-wrapper">
    <form class="auth-form" @submit.prevent="login">
      <h2>Вход</h2>
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit">Войти</button>
      <p class="switch-link">Нет аккаунта? <a @click.prevent="goToRegister" href="#">Зарегистрироваться</a></p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  mounted() {
    // Очищаем авторизацию при открытии страницы логина
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
  methods: {
    login() {
      axios.post('/api/login', { email: this.email, password: this.password })
        .then(res => {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('email', this.email);
          localStorage.setItem('userId', res.data.userId);
          // Получаем имя пользователя и сохраняем в userName
          axios.get(`/api/user/${res.data.userId}`).then(userRes => {
            const u = userRes.data;
            localStorage.setItem('userName', `${u.first_name} ${u.last_name}`);
            this.toast.success('Вход выполнен успешно!');
            if (res.data.role === 'admin') {
              this.$router.push('/users');
            } else {
              this.$router.push('/');
            }
          });
        })
        .catch(() => {
          this.toast.error('Неверный email или пароль');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('email');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
        });
    },
    goToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
}
.auth-form {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 300px;
}
.auth-form h2 {
  margin-bottom: 8px;
  text-align: center;
}
.auth-form input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
.auth-form button {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.auth-form button:hover {
  background: #1256a3;
}
.switch-link {
  text-align: center;
  font-size: 0.95rem;
}
.switch-link a {
  color: #1976d2;
  cursor: pointer;
}
.error {
  color: #e53935;
  text-align: center;
  font-size: 0.95rem;
}
</style>
