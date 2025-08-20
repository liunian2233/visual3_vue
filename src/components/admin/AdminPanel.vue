<template>
  <div class="admin-panel">
    <h2>管理面板</h2>
    
    <div class="tabs">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="tab-content">
      <div v-show="activeTab === 'image-upload'">
        <ImageUpload @sceneCreated="handleSceneCreated" />
      </div>
      
      <div v-show="activeTab === 'scene-creator'">
        <SceneCreator />
      </div>
      
      <div v-show="activeTab === 'scene-editor'">
        <SceneEditor />
      </div>
      
      <div v-show="activeTab === 'hotspot-editor'">
        <KonvaHotspotEditor />
      </div>
      
      <div v-show="activeTab === 'exam-config'">
        <ExamFlowConfig />
      </div>
      
      <div v-show="activeTab === 'score-settings'">
        <ScoreSettings />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import ExamFlowConfig from './ExamFlowConfig.vue';
import ScoreSettings from './ScoreSettings.vue';
import SceneEditor from './SceneEditor.vue';
import ImageUpload from './ImageUpload.vue';
import SceneCreator from './SceneCreator.vue';
import KonvaHotspotEditor from './KonvaHotspotEditor.vue';

export default {
  name: 'AdminPanel',
  components: {
    ExamFlowConfig,
    ScoreSettings,
    SceneEditor,
    ImageUpload,
    SceneCreator,
    KonvaHotspotEditor
  },
  setup() {
    const store = useStore();
    const activeTab = ref('image-upload');
    
    const tabs = [
      { id: 'image-upload', label: '上传图片' },
      { id: 'scene-creator', label: '创建场景' },
      { id: 'scene-editor', label: '编辑场景' },
      { id: 'hotspot-editor', label: '热点编辑' },
      { id: 'exam-config', label: '考试配置' },
      { id: 'score-settings', label: '评分设置' }
    ];
    
    const handleImageUpload = (imageData) => {
      console.log('图片上传成功:', imageData);
    };
    
    const handleSceneCreated = (sceneData) => {
      console.log('场景创建成功:', sceneData);
      // 调用Vuex的addScene action来完成场景创建
      store.dispatch('scene/addScene', sceneData);
      alert(`场景 "${sceneData.id}" 创建成功!`);
    };
    
    return {
      activeTab,
      tabs,
      handleImageUpload,
      handleSceneCreated
    };
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  overflow-y: auto;
  
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.tab-button:hover {
  background-color: #d5d5d5;
}

.tab-button.active {
  background-color: #1976d2;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  max-height: 80vh;
  overflow-y: auto;
}
</style>