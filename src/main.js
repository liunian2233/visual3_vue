import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import VueKonva from 'vue-konva';

// 创建应用实例
const app = createApp(App);

// 使用store和router
app.use(store);
app.use(router);
app.use(VueKonva);

// 挂载应用
app.mount('#app');