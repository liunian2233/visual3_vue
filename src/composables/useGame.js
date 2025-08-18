import { computed } from 'vue';
import { useStore } from 'vuex';

// 游戏相关组合函数
export function useGame() {
  const store = useStore();

  // 获取游戏状态
  const isPlaying = computed(() => store.getters['game/isGamePlaying']);
  const score = computed(() => store.getters['game/currentScore']);
  const progress = computed(() => store.getters['game/progress']);

  // 游戏操作函数
  const startGame = () => {
    store.dispatch('game/startGame');
  };

  const stopGame = () => {
    store.dispatch('game/stopGame');
  };

  const updateScore = (score) => {
    store.dispatch('game/updateScore', score);
  };

  const addScore = (points) => {
    store.dispatch('game/addScore', points);
  };

  const updateTime = (timeData) => {
    store.dispatch('game/updateTime', timeData);
  };

  return {
    // 状态
    isPlaying,
    score,
    progress,

    // 方法
    startGame,
    stopGame,
    updateScore,
    addScore,
    updateTime
  };
}