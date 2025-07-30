
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AdminHeader from './components/Admin/AdminHeader.vue';
import MainHeader from './components/Includes/MainHeader.vue';
import axios from 'axios';

const route = useRoute();
const showAdminHeader = computed(() => [
  '/users',
  '/products',
  '/categories'
].includes(route.path));
const showMainHeader = computed(() => !showAdminHeader.value);

const isAuth = computed(() => !!localStorage.getItem('token'));
const userName = ref('');

async function fetchUserName() {
  const id = localStorage.getItem('userId');
  if (!id) { userName.value = ''; return; }
  try {
    const res = await axios.get(`/api/user/${id}`);
    userName.value = res.data.first_name + (res.data.last_name ? ' ' + res.data.last_name : '');
  } catch { userName.value = ''; }
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
    <AdminHeader v-if="showAdminHeader" />
    <MainHeader v-else-if="showMainHeader" :isAuth="isAuth" :userName="userName" @login="$router.push('/login')" @profile="$router.push('/profile')" />
    <router-view />
  </div>
</template>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
  background: #f7f7fa;
  font-family: 'Segoe UI', Arial, sans-serif;
}
</style>
