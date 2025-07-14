<template>
  <div class="auth-wrapper">
    <form class="auth-form" @submit.prevent="register">
      <h2>Регистрация</h2>
      <input v-model="first_name" type="text" placeholder="Имя" required />
      <input v-model="last_name" type="text" placeholder="Фамилия" required />
      <input v-model="patronymic" type="text" placeholder="Отчество" />
      <input v-model="phone" type="tel" placeholder="Телефон" required @input="onPhoneInput" maxlength="16" />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit">Зарегистрироваться</button>
      <p class="switch-link">Уже есть аккаунт? <a @click.prevent="goToLogin" href="#">Войти</a></p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
export default {
  data() {
    return {
      first_name: '',
      last_name: '',
      patronymic: '',
      phone: '',
      email: '',
      password: '',
      error: '',
      success: ''
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    register() {
      axios.post('/api/register', {
        first_name: this.first_name,
        last_name: this.last_name,
        patronymic: this.patronymic,
        phone: this.phone,
        email: this.email,
        password: this.password
      })
        .then(res => {
          localStorage.setItem('userId', res.data.id);
          localStorage.setItem('email', this.email);
          this.toast.success('Регистрация прошла успешно!');
          setTimeout(() => {
            this.$router.push('/login');
          }, 1500);
        })
        .catch(() => {
          this.toast.error('Ошибка регистрации. Проверьте данные.');
        });
    },
    goToLogin() {
      this.$router.push('/login');
    },
    onPhoneInput(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.slice(0, 11);
      this.phone = '+' + value;
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
.success {
  color: #2e7d32;
  text-align: center;
  font-size: 0.95rem;
  margin-top: 8px;
}
</style>
