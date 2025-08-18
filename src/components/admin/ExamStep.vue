<template>
  <div class="exam-step">
    <div class="step-header">
      <span class="step-number">{{ stepNumber }}</span>
      <input 
        type="text" 
        class="step-title form-control" 
        :value="step.title" 
        @input="$emit('update:title', $event.target.value)"
        placeholder="步骤标题"
      >
      <button class="btn btn-danger btn-sm" @click="$emit('remove')">
        删除
      </button>
    </div>
    
    <div class="step-content">
      <div class="form-group">
        <label class="form-label">步骤描述:</label>
        <textarea 
          class="form-control" 
          :value="step.description" 
          @input="$emit('update:description', $event.target.value)"
          placeholder="步骤描述"
          rows="2"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">目标场景:</label>
        <input 
          type="text" 
          class="form-control" 
          :value="step.targetScene" 
          @input="$emit('update:targetScene', $event.target.value)"
          placeholder="目标场景ID"
        >
      </div>
      
      <div class="form-group">
        <label class="form-label">时间限制 (秒):</label>
        <input 
          type="number" 
          class="form-control" 
          :value="step.timeLimit" 
          @input="$emit('update:timeLimit', Number($event.target.value))"
          min="0"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamStep',
  props: {
    step: {
      type: Object,
      required: true
    },
    stepNumber: {
      type: Number,
      required: true
    }
  },
  emits: ['update:title', 'update:description', 'update:targetScene', 'update:timeLimit', 'remove']
};
</script>

<style scoped>
.exam-step {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.step-number {
  background-color: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.step-title {
  flex: 1;
}

.step-content {
  margin-left: 40px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 5px;
}
</style>