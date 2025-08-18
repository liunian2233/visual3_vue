// 热点状态管理
const hotspotModule = {
  namespaced: true,
  state: () => ({
    // 热点数据，按场景ID存储热点数组
    hotspots: {}
  }),
  mutations: {
    ADD_HOTSPOT(state, { sceneId, hotspot }) {
      console.log('Hotspot Mutation: ADD_HOTSPOT', sceneId, hotspot);
      if (!state.hotspots[sceneId]) {
        state.hotspots[sceneId] = [];
      }
      state.hotspots[sceneId].push(hotspot);
    },
    REMOVE_HOTSPOT(state, { sceneId, hotspotIndex }) {
      console.log('Hotspot Mutation: REMOVE_HOTSPOT', sceneId, hotspotIndex);
      console.log('Current hotspots state:', state.hotspots);
      
      // 添加更多检查
      if (!sceneId) {
        console.error('REMOVE_HOTSPOT: sceneId is required');
        return;
      }
      
      if (typeof hotspotIndex !== 'number') {
        console.error('REMOVE_HOTSPOT: hotspotIndex must be a number');
        return;
      }
      
      if (!state.hotspots[sceneId]) {
        console.error('REMOVE_HOTSPOT: Scene not found', sceneId);
        return;
      }
      
      if (hotspotIndex < 0 || hotspotIndex >= state.hotspots[sceneId].length) {
        console.error('REMOVE_HOTSPOT: Invalid hotspot index', hotspotIndex);
        return;
      }
      
      // 执行删除操作
      const removed = state.hotspots[sceneId].splice(hotspotIndex, 1);
      console.log('Hotspot removed:', removed);
    },
    UPDATE_HOTSPOT(state, { sceneId, hotspotIndex, hotspot }) {
      console.log('Hotspot Mutation: UPDATE_HOTSPOT', sceneId, hotspotIndex, hotspot);
      if (state.hotspots[sceneId] && state.hotspots[sceneId][hotspotIndex]) {
        state.hotspots[sceneId][hotspotIndex] = { 
          ...state.hotspots[sceneId][hotspotIndex], 
          ...hotspot 
        };
      }
    },
    SET_HOTSPOTS(state, hotspots) {
      console.log('Hotspot Mutation: SET_HOTSPOTS', hotspots);
      state.hotspots = hotspots;
    },
    // 添加SET_STATE mutation以支持从IndexedDB恢复状态
    SET_STATE(state, newState) {
      console.log('Hotspot Mutation: SET_STATE', newState);
      Object.assign(state, newState);
      console.log('Hotspot Mutation: SET_STATE 完成，当前state', state);
    }
  },
  actions: {
    addHotspot({ commit }, payload) {
      console.log('Hotspot Action: addHotspot', payload);
      commit('ADD_HOTSPOT', payload);
    },
    removeHotspot({ commit }, payload) {
      console.log('Hotspot Action: removeHotspot', payload);
      commit('REMOVE_HOTSPOT', payload);
    },
    updateHotspot({ commit }, payload) {
      console.log('Hotspot Action: updateHotspot', payload);
      commit('UPDATE_HOTSPOT', payload);
    },
    setHotspots({ commit }, hotspots) {
      console.log('Hotspot Action: setHotspots', hotspots);
      commit('SET_HOTSPOTS', hotspots);
    }
  },
  getters: {
    sceneHotspots: (state) => (sceneId) => {
      console.log('Hotspot Getter: sceneHotspots', sceneId, state.hotspots[sceneId]);
      return state.hotspots[sceneId] || [];
    },
    // 根据场景ID获取热点
    getHotspotsByScene: (state) => (sceneId) => {
      return state.hotspots[sceneId] || [];
    }
  }
};

export default hotspotModule;