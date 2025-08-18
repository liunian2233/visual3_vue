import { computed } from 'vue';
import { useStore } from 'vuex';

// 考试相关组合函数
export function useExam() {
  const store = useStore();

  // 获取考试状态
  const examConfig = computed(() => store.getters['exam/examConfig']);
  const scoreSettings = computed(() => store.getters['exam/scoreSettings']);
  const isExamMode = computed(() => store.getters['exam/isExamMode']);
  const examStartTime = computed(() => store.getters['exam/examStartTime']);
  const examEndTime = computed(() => store.getters['exam/examEndTime']);
  const completedScenes = computed(() => store.getters['exam/completedScenes']);
  const isSceneCompleted = (sceneId) => store.getters['exam/isSceneCompleted'](sceneId);
  const examDuration = computed(() => store.getters['exam/examDuration']);
  const remainingTime = computed(() => store.getters['exam/remainingTime']);

  // 考试操作函数
  const updateExamConfig = (config) => {
    store.dispatch('exam/updateExamConfig', config);
  };

  const updateScoreSettings = (scores) => {
    store.dispatch('exam/updateScoreSettings', scores);
  };

  const startExam = () => {
    store.dispatch('exam/startExam');
  };

  const endExam = () => {
    store.dispatch('exam/endExam');
  };

  const completeScene = (sceneId) => {
    store.dispatch('exam/completeScene', sceneId);
  };

  const resetExam = () => {
    store.dispatch('exam/resetExam');
  };

  return {
    // 状态
    examConfig,
    scoreSettings,
    isExamMode,
    examStartTime,
    examEndTime,
    completedScenes,
    isSceneCompleted,
    examDuration,
    remainingTime,

    // 方法
    updateExamConfig,
    updateScoreSettings,
    startExam,
    endExam,
    completeScene,
    resetExam
  };
}