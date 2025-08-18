import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';

// 创建应用实例
const app = createApp(App);

// 使用store和router
app.use(store);
app.use(router);

// 挂载应用
app.mount('#app');