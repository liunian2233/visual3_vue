<template>
  <div class="exam-status-panel">
    <div class="status-item">
      <span class="label">当前场景:</span>
      <span class="value">{{ currentScene }}</span>
    </div>
    <div class="status-item">
      <span class="label">历史记录:</span>
      <span class="value">{{ historyLength }} 项</span>
    </div>
    <div class="status-item">
      <span class="label">显示模式:</span>
      <span class="value">{{ displayMode }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamStatusPanel',
  props: {
    currentScene: {
      type: String,
      default: ''
    },
    historyLength: {
      type: Number,
      default: 0
    },
    displayMode: {
      type: String,
      default: 'cover'
    }
  }
};
</script>

<style scoped>
.exam-status-panel {
  position: absolute;
  top: 15px;
  right: 70px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  min-width: 150px;
}

.status-item {
  margin-bottom: 5px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.value {
  font-weight: normal;
}
</style>