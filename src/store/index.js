import { createStore } from 'vuex';
import game from './game';
import scene from './scene';
import hotspot from './hotspot';
import exam from './exam';
import { indexedDBStorage } from '../utils/indexedDBStorage';

// 状态恢复完成的Promise
let stateRestorePromise = null;

// 创建自定义的持久化插件
const customPersistedState = (store) => {
  // 在store初始化时恢复状态
  const restoreState = async () => {
    try {
      // 确保IndexedDB已初始化
      await indexedDBStorage.ensureInitialized();
      
      // 恢复各个模块的状态
      const modules = ['scene', 'exam', 'hotspot', 'game'];
      for (const module of modules) {
        const data = await indexedDBStorage.getItem(module);
        if (data) {
          store.commit(`${module}/SET_STATE`, data);
        }
      }
    } catch (error) {
      console.error('状态恢复失败:', error);
    }
  };
  
  // 创建状态恢复Promise
  stateRestorePromise = restoreState();
  
  // 先恢复状态再订阅变化
  stateRestorePromise.then(() => {
    // 订阅状态变化以保存到IndexedDB
    store.subscribe((mutation, state) => {
      try {
        // 保存变化的模块状态
        const modules = ['scene', 'exam', 'hotspot', 'game'];
        for (const module of modules) {
          if (mutation.type.startsWith(`${module}/`)) {
            const moduleState = state[module];
            indexedDBStorage.setItem(module, moduleState);
            break;
          }
        }
      } catch (error) {
        console.error('状态保存失败:', error);
      }
    });
  });
};

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      // 根状态
    };
  },
  mutations: {
    // 根级别的 mutation
  },
  actions: {
    // 根级别的 action
  },
  modules: {
    // 子模块
    game,
    scene,
    hotspot,
    exam
  },
  plugins: [
    customPersistedState
  ]
});

// 添加状态恢复完成的等待方法
store.waitForStateRestore = () => {
  return stateRestorePromise || Promise.resolve();
};

export default store;