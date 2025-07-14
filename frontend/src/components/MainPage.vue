<template>
  <div class="main-page">
    <MainHeader :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <section class="welcome-section">
      <h2>Добро пожаловать!</h2>
      <p>У нас вы найдёте оригинальные и совместимые запчасти для холодильников, стиральных машин, посудомоек, плит и другой бытовой техники.</p>
      <ul class="categories">
        <li>Холодильники</li>
        <li>Стиральные машины</li>
        <li>Посудомоечные машины</li>
        <li>Плиты и духовки</li>
        <li>Мелкая техника</li>
        <li>Аксессуары и расходники</li>
      </ul>
    </section>
    <section class="info-section">
      <h3>Почему выбирают нас?</h3>
      <ul>
        <li>Широкий ассортимент запчастей</li>
        <li>Быстрая доставка по всей России</li>
        <li>Гарантия на все товары</li>
        <li>Профессиональная поддержка</li>
      </ul>
    </section>
    <footer class="main-footer">
      <p>&copy; 2025 Магазин запчастей для бытовой техники</p>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import MainHeader from './MainHeader.vue';
export default {
  name: 'MainPage',
  components: { MainHeader },
  data() {
    return {
      userName: ''
    }
  },
  computed: {
    isAuth() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    goLogin() {
      this.$router.push('/login');
    },
    goProfile() {
      this.$router.push('/profile');
    },
    async fetchUserName() {
      const id = localStorage.getItem('userId');
      if (!id) return;
      try {
        const res = await axios.get(`/api/user/${id}`);
        this.userName = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
      } catch {}
    }
  },
  mounted() {
    if (this.isAuth) this.fetchUserName();
  },
  watch: {
    isAuth(val) {
      if (val) this.fetchUserName();
      else this.userName = '';
    }
  }
}
</script>

<style scoped>
.main-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f7fa;
  color: #222;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.welcome-section {
  padding: 2rem 1rem 1rem 1rem;
  text-align: center;
}
.welcome-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0 0 0;
  padding: 0;
  list-style: none;
}
.categories li {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1rem 2rem;
  font-size: 1.1rem;
  min-width: 160px;
  margin-bottom: 0.5rem;
}
.info-section {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}
.info-section h3 {
  margin-top: 0;
}
.info-section ul {
  padding-left: 1.2rem;
}
.main-footer {
  margin-top: auto;
  background: #2d3e50;
  color: #fff;
  text-align: center;
  padding: 1rem;
  font-size: 0.95rem;
}
</style>
