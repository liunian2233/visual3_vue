<template>
  <div class="image-upload-scene-creator">
    <h3>上传图片并创建场景</h3>
    <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileSelect" 
        accept="image/*" 
        style="display: none"
      >
      <div class="drop-zone" @click="triggerFileInput">
        <p v-if="!selectedFile">拖拽图片到此处或点击选择文件</p>
        <p v-else>已选择: {{ selectedFile.name }}</p>
        <button type="button">选择图片</button>
      </div>
    </div>
    
    <div v-if="previewUrl" class="image-preview">
      <h4>图片预览</h4>
      <img :src="previewUrl" alt="预览图片" style="max-width: 100%; max-height: 200px;">
    </div>
    
    <div class="scene-form" v-if="selectedFile">
      <div class="form-group">
        <label>场景ID:</label>
        <input type="text" v-model="sceneData.id" placeholder="输入唯一场景ID" />
      </div>
      
      <div class="form-group">
        <label>场景描述:</label>
        <textarea v-model="sceneData.description" placeholder="输入场景描述"></textarea>
      </div>
      
      <div class="form-group">
        <label>显示模式:</label>
        <select v-model="sceneData.imageDisplayMode">
          <option value="cover">覆盖 (Cover)</option>
          <option value="contain">包含 (Contain)</option>
          <option value="fill">填充 (Fill)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>导航设置:</label>
        <div class="navigation-grid">
          <div class="nav-item">
            <label>向上:</label>
            <select v-model="sceneData.navigation.up">
              <option value="">无</option>
              <option v-for="scene in allScenes" :key="`up-${scene.id}`" :value="scene.id">
                {{ scene.id }} - {{ scene.description || '无描述' }}
              </option>
            </select>
          </div>
          <div class="nav-item">
            <label>向左:</label>
            <select v-model="sceneData.navigation.left">
              <option value="">无</option>
              <option v-for="scene in allScenes" :key="`left-${scene.id}`" :value="scene.id">
                {{ scene.id }} - {{ scene.description || '无描述' }}
              </option>
            </select>
          </div>
          <div class="nav-item">
            <label>向右:</label>
            <select v-model="sceneData.navigation.right">
              <option value="">无</option>
              <option v-for="scene in allScenes" :key="`right-${scene.id}`" :value="scene.id">
                {{ scene.id }} - {{ scene.description || '无描述' }}
              </option>
            </select>
          </div>
          <div class="nav-item">
            <label>向下:</label>
            <select v-model="sceneData.navigation.down">
              <option value="">无</option>
              <option v-for="scene in allScenes" :key="`down-${scene.id}`" :value="scene.id">
                {{ scene.id }} - {{ scene.description || '无描述' }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <button @click="uploadImage" :disabled="uploading">
        {{ uploading ? '上传中...' : '上传并创建场景' }}
      </button>
    </div>
    
    <div v-if="uploadSuccess" class="success-message">
      场景创建成功！
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ImageUploadAndSceneCreator',
  emits: ['sceneCreated'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const selectedFile = ref(null);
    const previewUrl = ref('');
    const uploading = ref(false);
    const uploadSuccess = ref(false);
    const store = useStore();
    
    // 获取所有场景
    const allScenes = computed(() => store.getters['scene/allScenes']);
    
    // 场景数据
    const sceneData = ref({
      id: '',
      description: '',
      imageDisplayMode: 'cover',
      navigation: {
        up: null,
        down: null,
        left: null,
        right: null
      }
    });
    
    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        selectedFile.value = file;
        createPreview(file);
      }
    };
    
    // 处理拖拽上传
    const handleDrop = (event) => {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        selectedFile.value = file;
        createPreview(file);
      }
    };
    
    // 创建预览
    const createPreview = (file) => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = URL.createObjectURL(file);
    };
    
    // 上传图片
    const uploadImage = async () => {
      if (!selectedFile.value || !sceneData.value.id) {
        alert('请选择图片并输入场景ID');
        return;
      }
      
      uploading.value = true;
      
      try {
        // 在实际应用中，这里会是真实的上传逻辑
        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 创建场景数据对象
        const newScene = {
          id: sceneData.value.id,
          image: `images/${selectedFile.value.name}`, // 在实际应用中应该是服务器返回的URL
          imageDisplayMode: sceneData.value.imageDisplayMode,
          description: sceneData.value.description,
          navigation: { ...sceneData.value.navigation }
        };
        
        // 添加场景到store
        store.dispatch('scene/addScene', newScene);
        
        // 通知父组件场景已创建
        emit('sceneCreated', newScene);
        
        uploadSuccess.value = true;
        
        // 重置表单
        setTimeout(() => {
          selectedFile.value = null;
          sceneData.value = {
            id: '',
            description: '',
            imageDisplayMode: 'cover',
            navigation: {
              up: null,
              down: null,
              left: null,
              right: null
            }
          };
          if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
            previewUrl.value = '';
          }
          uploadSuccess.value = false;
        }, 2000);
      } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
      } finally {
        uploading.value = false;
      }
    };
    
    return {
      fileInput,
      selectedFile,
      previewUrl,
      uploading,
      uploadSuccess,
      sceneData,
      allScenes,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      uploadImage
    };
  }
};
</script>

<style scoped>
.image-upload-scene-creator {
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 75vh;
  overflow-y: auto;
}

h3 {
  margin-top: 0;
  color: #333;
}

h4 {
  margin-top: 0;
  color: #333;
}

.upload-area {
  margin-bottom: 20px;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.drop-zone:hover {
  border-color: #007bff;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"], 
textarea, 
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.nav-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: normal;
}

.nav-item select {
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
  width: 100%;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  text-align: center;
  margin-top: 15px;
}
</style>