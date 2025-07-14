<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminHeader from './components/AdminHeader.vue';
const route = useRoute();
const showAdminHeader = computed(() => [
  '/users',
  '/products',
  '/categories'
].includes(route.path));
</script>

<template>
  <div>
    <AdminHeader v-if="showAdminHeader" />
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
