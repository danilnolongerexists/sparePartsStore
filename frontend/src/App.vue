
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import MainHeader from './components/Includes/MainHeader.vue';
import axios from 'axios';

const route = useRoute();

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
    <MainHeader :isAuth="isAuth" :userName="userName" @login="goLogin" @profile="goProfile" />
    <router-view />
  </div>
</template>

<style scoped>


</style>
