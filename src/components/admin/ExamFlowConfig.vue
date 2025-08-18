<template>
  <div class="exam-flow-config">
    <h3>考试流程配置</h3>
    
    <div class="config-section">
      <h4>基本设置</h4>
      <div class="config-item">
        <label>考试时长（分钟）:</label>
        <input type="number" v-model="examDuration" />
      </div>
      <div class="config-item">
        <label>场景切换时间限制（秒）:</label>
        <input type="number" v-model="sceneTransitionLimit" />
      </div>
      <div class="config-item">
        <label>允许返回上一场景:</label>
        <input type="checkbox" v-model="allowGoBack" />
      </div>
    </div>
    
    <div class="config-section">
      <h4>考试步骤</h4>
      <DraggableList 
        :items="examSteps" 
        @move-up="moveStepUp" 
        @move-down="moveStepDown"
        @reorder="reorderSteps"
      >
        <template #default="{ item, index }">
          <ExamStep 
            :step="item"
            :step-number="index + 1"
            @update:title="updateStep(index, 'title', $event)"
            @update:description="updateStep(index, 'description', $event)"
            @update:targetScene="updateStep(index, 'targetScene', $event)"
            @update:timeLimit="updateStep(index, 'timeLimit', $event)"
            @remove="removeStep(index)"
          />
        </template>
      </DraggableList>
      
      <button class="btn btn-primary" @click="addStep">
        添加步骤
      </button>
    </div>
    
    <button class="btn btn-success" @click="saveConfig">保存配置</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import DraggableList from './DraggableList.vue';
import ExamStep from './ExamStep.vue';

export default {
  name: 'ExamFlowConfig',
  components: {
    DraggableList,
    ExamStep
  },
  setup() {
    const examDuration = ref(60);
    const sceneTransitionLimit = ref(10);
    const allowGoBack = ref(true);
    
    // 考试步骤
    const examSteps = ref([
      {
        id: 1,
        title: '初始场景',
        description: '考试开始时的第一个场景',
        targetScene: '',
        timeLimit: 0
      }
    ]);
    
    // 添加步骤
    const addStep = () => {
      const newStep = {
        id: Date.now(),
        title: `步骤 ${examSteps.value.length + 1}`,
        description: '',
        targetScene: '',
        timeLimit: 0
      };
      examSteps.value.push(newStep);
    };
    
    // 更新步骤
    const updateStep = (index, field, value) => {
      examSteps.value[index][field] = value;
    };
    
    // 删除步骤
    const removeStep = (index) => {
      if (examSteps.value.length > 1) {
        examSteps.value.splice(index, 1);
      } else {
        alert('至少需要保留一个步骤');
      }
    };
    
    // 上移步骤
    const moveStepUp = (index) => {
      if (index > 0) {
        const temp = examSteps.value[index];
        examSteps.value[index] = examSteps.value[index - 1];
        examSteps.value[index - 1] = temp;
      }
    };
    
    // 下移步骤
    const moveStepDown = (index) => {
      if (index < examSteps.value.length - 1) {
        const temp = examSteps.value[index];
        examSteps.value[index] = examSteps.value[index + 1];
        examSteps.value[index + 1] = temp;
      }
    };
    
    // 重新排序步骤
    const reorderSteps = (fromIndex, toIndex) => {
      const movedItem = examSteps.value.splice(fromIndex, 1)[0];
      examSteps.value.splice(toIndex, 0, movedItem);
    };
    
    const saveConfig = () => {
      // 保存配置逻辑
      const config = {
        examDuration: examDuration.value,
        sceneTransitionLimit: sceneTransitionLimit.value,
        allowGoBack: allowGoBack.value,
        examSteps: examSteps.value
      };
      
      console.log('保存考试流程配置:', config);
      alert('考试流程配置保存成功!');
    };
    
    return {
      examDuration,
      sceneTransitionLimit,
      allowGoBack,
      examSteps,
      addStep,
      updateStep,
      removeStep,
      moveStepUp,
      moveStepDown,
      reorderSteps,
      saveConfig
    };
  }
};
</script>

<style scoped>
.exam-flow-config {
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h3 {
  margin-top: 0;
  color: #333;
}

.config-section {
  margin-bottom: 20px;
}

.config-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
}

.config-item {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="number"], input[type="checkbox"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

input[type="checkbox"] {
  width: auto;
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

.btn-success {
  background-color: #28a745;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>