// 游戏状态管理
const gameModule = {
  namespaced: true,
  state: () => ({
    // 游戏设置
    settings: {
      enableHotspots: true,
      enableNavigation: true,
      displayMode: 'contain'
    },
    // 游戏状态
    isPlaying: false,
    score: 0
  }),
  mutations: {
    SET_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    SET_PLAYING(state, isPlaying) {
      state.isPlaying = isPlaying;
    },
    SET_SCORE(state, score) {
      state.score = score;
    },
    INCREMENT_SCORE(state, amount = 1) {
      state.score += amount;
    }
  },
  actions: {
    updateSettings({ commit }, settings) {
      commit('SET_SETTINGS', settings);
    },
    startGame({ commit }) {
      commit('SET_PLAYING', true);
    },
    stopGame({ commit }) {
      commit('SET_PLAYING', false);
    },
    setScore({ commit }, score) {
      commit('SET_SCORE', score);
    },
    addScore({ commit }, amount = 1) {
      commit('INCREMENT_SCORE', amount);
    }
  },
  getters: {
    isGameActive: (state) => state.isPlaying,
    gameScore: (state) => state.score,
    gameSettings: (state) => state.settings
  }
};

export default gameModule;