<template>
  <div class="admin-view">
    <AdminPanel />
  </div>
</template>

<script>
import AdminPanel from '../components/admin/AdminPanel.vue';

export default {
  name: 'AdminView',
  components: {
    AdminPanel
  }
};
</script>

<style scoped>
.admin-view {
  width: 100%;
  height: 100%;
}
</style>