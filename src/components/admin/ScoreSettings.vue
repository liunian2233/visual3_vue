<template>
  <div class="score-settings">
    <h3>评分设置</h3>
    <div class="setting-item">
      <label>完成场景得分:</label>
      <input type="number" v-model="sceneCompletionScore" />
    </div>
    <div class="setting-item">
      <label>时间奖励系数:</label>
      <input type="number" step="0.1" v-model="timeBonusMultiplier" />
    </div>
    <div class="setting-item">
      <label>错误惩罚分:</label>
      <input type="number" v-model="errorPenalty" />
    </div>
    <button @click="saveSettings">保存设置</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ScoreSettings',
  setup() {
    const sceneCompletionScore = ref(10);
    const timeBonusMultiplier = ref(1.5);
    const errorPenalty = ref(5);

    const saveSettings = () => {
      // 保存评分设置逻辑
      console.log('保存评分设置');
    };

    return {
      sceneCompletionScore,
      timeBonusMultiplier,
      errorPenalty,
      saveSettings
    };
  }
};
</script>

<style scoped>
.score-settings {
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h3 {
  margin-top: 0;
  color: #333;
}

.setting-item {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>