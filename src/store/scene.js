// 场景状态管理模块
export default {
  namespaced: true,
  state: () => ({
    scenes: {}, // 存储所有场景
    currentScene: null, // 当前场景
    sceneHistory: [], // 场景历史记录
    defaultScene: null // 默认场景ID
  }),
  
  getters: {
    // 获取所有场景
    allScenes: (state) => state.scenes,
    
    // 根据ID获取特定场景
    getSceneById: (state) => (id) => {
      return state.scenes[id];
    },
    
    // 获取默认场景ID
    defaultScene: (state) => state.defaultScene
  },
  
  mutations: {
    // 设置整个场景状态
    SET_STATE(state, newState) {
      Object.assign(state, newState);
    },
    
    // 添加或更新场景
    ADD_SCENE(state, scene) {
      const { id, ...sceneData } = scene;
      state.scenes = { ...state.scenes, [id]: sceneData };
    },
    
    // 删除场景
    REMOVE_SCENE(state, sceneId) {
      const newScenes = { ...state.scenes };
      delete newScenes[sceneId];
      state.scenes = newScenes;
    },
    
    // 更新场景
    UPDATE_SCENE(state, scene) {
      const { id, ...sceneData } = scene;
      state.scenes = { ...state.scenes, [id]: sceneData };
    },
    
    // 设置默认场景
    SET_DEFAULT_SCENE(state, sceneId) {
      state.defaultScene = sceneId;
    },
    
    SET_CURRENT_SCENE(state, sceneId) {
      state.currentScene = sceneId;
    },
    
    ADD_SCENE_HISTORY(state, sceneId) {
      state.sceneHistory.push(sceneId);
    },
    
    CLEAR_SCENE_HISTORY(state) {
      state.sceneHistory = [];
    }
  },
  
  actions: {
    // 添加新场景
    addScene({ commit }, scene) {
      commit('ADD_SCENE', scene);
    },
    
    // 删除场景
    removeScene({ commit }, sceneId) {
      commit('REMOVE_SCENE', sceneId);
    },
    
    // 更新场景
    updateScene({ commit }, scene) {
      commit('UPDATE_SCENE', scene);
    },
    
    // 设置默认场景
    setDefaultScene({ commit }, sceneId) {
      commit('SET_DEFAULT_SCENE', sceneId);
    },
    
    switchScene({ commit, state }, sceneId) {
      if (state.scenes[sceneId]) {
        commit('SET_CURRENT_SCENE', sceneId);
        commit('ADD_SCENE_HISTORY', sceneId);
      }
    },
    
    goBack({ commit, state }) {
      if (state.sceneHistory.length > 1) {
        // 移除当前场景
        state.sceneHistory.pop();
        // 获取上一个场景
        const previousScene = state.sceneHistory[state.sceneHistory.length - 1];
        commit('SET_CURRENT_SCENE', previousScene);
      }
    }
  }
};