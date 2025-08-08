<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import MainHeader from './components/Includes/MainHeader.vue';
import Navigation from './components/Includes/Navigation.vue';
import Footer from './components/Includes/Footer.vue';
import axios from 'axios';

const route = useRoute();

const isAuth = ref(!!localStorage.getItem('token'));
const userName = ref('');

async function fetchUserName() {
  const id = localStorage.getItem('userId');
  if (!id) { userName.value = ''; return; }
  try {
    const res = await axios.get(`/api/user/${id}`);
    userName.value = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
  } catch { userName.value = ''; }
}

function handleLogin() {
  isAuth.value = !!localStorage.getItem('token');
  fetchUserName();
}

function goProfile() {
  // Переход на страницу профиля
  window.location.href = '/profile';
  // Или, если используете composition API router:
  // import { useRouter } from 'vue-router';
  // const router = useRouter();
  // router.push('/profile');
}

onMounted(() => {
  if (isAuth.value) fetchUserName();
});
watch(isAuth, (val) => {
  if (val) fetchUserName();
  else userName.value = '';
});
</script>

<template>
  <div>
    <MainHeader :isAuth="isAuth" :userName="userName" @login="handleLogin" @profile="goProfile" />
    <Navigation :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <router-view />
    <Footer />
  </div>
</template>

<style scoped>


</style>
