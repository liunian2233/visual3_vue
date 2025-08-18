<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
/* 引入全局样式 */
@import './assets/styles/global.css';

/* 重置页面边距和设置全屏显示 */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  font-family: Arial, sans-serif;
  overflow: hidden;
}
</style>