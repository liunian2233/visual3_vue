<template>
  <div class="scene-creator">
    <h3>创建新场景</h3>
    <div class="form-group">
      <label class="form-label">场景ID:</label>
      <input 
        type="text" 
        class="form-control" 
        v-model="sceneData.id" 
        placeholder="输入唯一场景ID"
      >
    </div>
    
    <div class="form-group">
      <label class="form-label">场景描述:</label>
      <textarea 
        class="form-control" 
        v-model="sceneData.description" 
        placeholder="输入场景描述"
        rows="3"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label class="form-label">图片URL:</label>
      <select class="form-control" v-model="sceneData.image">
        <option value="">请选择已上传的图片</option>
        <option 
          v-for="image in uploadedImages" 
          :key="image.url" 
          :value="image.url"
        >
          {{ image.name }} ({{ image.url }})
        </option>
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">显示模式:</label>
      <select class="form-control" v-model="sceneData.imageDisplayMode">
        <option value="cover">覆盖 (Cover)</option>
        <option value="contain">包含 (Contain)</option>
        <option value="fill">填充 (Fill)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">导航设置:</label>
      <div class="navigation-grid">
        <div class="nav-item">
          <label>向上:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="sceneData.navigation.up" 
            placeholder="目标场景ID"
          >
        </div>
        <div class="nav-item">
          <label>向左:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="sceneData.navigation.left" 
            placeholder="目标场景ID"
          >
        </div>
        <div class="nav-item">
          <label>向右:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="sceneData.navigation.right" 
            placeholder="目标场景ID"
          >
        </div>
        <div class="nav-item">
          <label>向下:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="sceneData.navigation.down" 
            placeholder="目标场景ID"
          >
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button class="btn btn-primary" @click="createScene">创建场景</button>
      <button class="btn btn-secondary" @click="resetForm">重置</button>
    </div>
    
    <div v-if="successMessage" class="alert alert-success mt-3">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'SceneCreator',
  setup() {
    const store = useStore();
    const successMessage = ref('');
    
    // 获取已上传的图片（模拟数据，实际应该从store或其他地方获取）
    const uploadedImages = computed(() => {
      // 这里应该从实际的图片上传记录中获取数据
      // 目前使用模拟数据
      const scenes = store.getters['scene/allScenes'];
      const images = [];
      
      // 从场景中提取图片信息
      Object.values(scenes).forEach(scene => {
        if (scene.image && !images.find(img => img.url === scene.image)) {
          images.push({
            url: scene.image,
            name: scene.image.split('/').pop() || scene.image
          });
        }
      });
      
      return images;
    });
    
    // 场景数据
    const sceneData = reactive({
      id: '',
      description: '',
      image: '',
      imageDisplayMode: 'cover',
      navigation: {
        up: null,
        down: null,
        left: null,
        right: null
      }
    });
    
    // 创建场景
    const createScene = () => {
      if (!sceneData.id) {
        alert('请输入场景ID');
        return;
      }
      
      if (!sceneData.image) {
        alert('请选择图片');
        return;
      }
      
      // 添加场景到store
      store.dispatch('scene/addScene', { ...sceneData });
      
      successMessage.value = `场景 "${sceneData.id}" 创建成功!`;
      
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    };
    
    // 重置表单
    const resetForm = () => {
      sceneData.id = '';
      sceneData.description = '';
      sceneData.image = '';
      sceneData.imageDisplayMode = 'cover';
      sceneData.navigation = {
        up: null,
        down: null,
        left: null,
        right: null
      };
    };
    
    return {
      sceneData,
      successMessage,
      uploadedImages,
      createScene,
      resetForm
    };
  }
};
</script>

<style scoped>
.scene-creator {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.nav-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.alert {
  padding: 10px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>