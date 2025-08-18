<template>
  <div class="login-view">
    <Login />
  </div>
</template>

<script>
import Login from '../components/auth/Login.vue';

export default {
  name: 'LoginView',
  components: {
    Login
  }
};
</script>

<style scoped>
.login-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}
</style>