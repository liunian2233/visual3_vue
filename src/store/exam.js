// 考试状态管理
const examModule = {
  namespaced: true,
  state: () => ({
    // 考试配置和状态
    config: {
      duration: 60, // 考试时长（分钟）
      sceneTransitionLimit: 10, // 场景切换时间限制（秒）
      allowGoBack: true // 是否允许返回上一场景
    },
    scores: {
      sceneCompletionScore: 10, // 完成场景得分
      timeBonusMultiplier: 1.5, // 时间奖励系数
      errorPenalty: 5 // 错误惩罚分
    },
    isExamMode: false,
    startTime: null,
    endTime: null,
    completedScenes: []
  }),
  mutations: {
    SET_EXAM_CONFIG(state, config) {
      state.config = { ...state.config, ...config };
    },
    SET_SCORE_SETTINGS(state, scores) {
      state.scores = { ...state.scores, ...scores };
    },
    SET_EXAM_MODE(state, isExamMode) {
      state.isExamMode = isExamMode;
    },
    SET_START_TIME(state, time) {
      state.startTime = time;
    },
    SET_END_TIME(state, time) {
      state.endTime = time;
    },
    ADD_COMPLETED_SCENE(state, sceneId) {
      if (!state.completedScenes.includes(sceneId)) {
        state.completedScenes.push(sceneId);
      }
    },
    RESET_EXAM(state) {
      state.startTime = null;
      state.endTime = null;
      state.completedScenes = [];
    },
  },
  actions: {
    updateExamConfig({ commit }, config) {
      commit('SET_EXAM_CONFIG', config);
    },
    updateScoreSettings({ commit }, scores) {
      commit('SET_SCORE_SETTINGS', scores);
    },
    startExam({ commit }) {
      commit('SET_EXAM_MODE', true);
      commit('SET_START_TIME', new Date());
      commit('RESET_EXAM');
    },
    endExam({ commit }) {
      commit('SET_EXAM_MODE', false);
      commit('SET_END_TIME', new Date());
    },
    completeScene({ commit }, sceneId) {
      commit('ADD_COMPLETED_SCENE', sceneId);
    },
    resetExam({ commit }) {
      commit('RESET_EXAM');
    }
  },
  getters: {
    examConfig: (state) => state.config,
    scoreSettings: (state) => state.scores,
    isExamMode: (state) => state.isExamMode,
    examStartTime: (state) => state.startTime,
    examEndTime: (state) => state.endTime,
    completedScenes: (state) => state.completedScenes,
    isSceneCompleted: (state) => (sceneId) => {
      return state.completedScenes.includes(sceneId);
    },
    examDuration: (state) => state.config.duration * 60 * 1000, // 转换为毫秒
    remainingTime: (state, getters) => {
      if (!state.startTime) return getters.examDuration;
      const now = state.endTime || new Date();
      const elapsed = now - state.startTime;
      return Math.max(0, getters.examDuration - elapsed);
    }
  }
};

export default examModule;