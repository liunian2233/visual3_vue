<template>
  <div class="scene-editor">
    <h3>编辑场景</h3>
    
    <!-- 图片放大预览模态框 -->
    <div v-if="isImageModalOpen" class="image-modal" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <span class="close-button" @click="closeImageModal">&times;</span>
        <img :src="modalImageSrc" alt="图片预览" class="modal-image" />
      </div>
    </div>
    
    <!-- 场景选择区域 - 使用图片预览方式 -->
    <div v-if="!currentScene" class="scene-selection">
      <h4>选择要编辑的场景</h4>
      <div class="scene-grid">
        <div 
          v-for="scene in allScenesArray" 
          :key="scene.id" 
          class="scene-card"
          @click="selectScene(scene.id)"
        >
          <div class="scene-image-preview">
            <img 
              v-if="scene.image" 
              :src="getImagePath(scene.image)" 
              :alt="scene.description || scene.id"
              class="scene-image"
            >
            <div v-else class="no-image">无图片</div>
            <div 
              class="set-default-icon"
              :class="{ active: scene.id === defaultSceneId }"
              @click.stop="setDefaultScene(scene.id)"
              title="设为默认场景"
            >
              ★
            </div>
            <div 
              class="delete-scene-icon"
              @click.stop="deleteScene(scene.id)"
              title="删除场景"
            >
              🗑️
            </div>
          </div>
          <div class="scene-info">
            <div class="scene-id">{{ scene.id }}</div>
            <div class="scene-description">{{ scene.description || '无描述' }}</div>
          </div>
        </div>
      </div>
      
      <!-- 默认场景设置 -->
      <div class="default-scene-settings" v-if="allScenesArray.length > 0">
        <h4>默认场景设置</h4>
        <div class="form-group">
          <label class="form-label">选择默认场景:</label>
          <select 
            v-model="defaultSceneId"
            class="form-control"
            @change="updateDefaultScene"
          >
            <option value="">无默认场景</option>
            <option 
              v-for="scene in allScenesArray" 
              :key="scene.id" 
              :value="scene.id"
            >
              {{ scene.id }} - {{ scene.description || '无描述' }}
            </option>
          </select>
          <div class="form-hint">
            选择一个场景作为系统启动时的默认场景
          </div>
        </div>
        
        <div v-if="defaultSceneId" class="current-default">
          <p>当前默认场景: <strong>{{ defaultSceneId }}</strong></p>
        </div>
        
        <div v-else class="no-default">
          <p>当前未设置默认场景</p>
        </div>
      </div>
    </div>
    
    <!-- 场景编辑表单 -->
    <div v-else class="scene-form">
      <div class="form-header">
        <h4>编辑场景: {{ currentScene.id }}</h4>
        <button class="btn btn-secondary" @click="backToSelection">返回选择</button>
      </div>
      
      <div class="form-group">
        <label class="form-label">场景ID:</label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.id" 
          readonly
        >
      </div>
      
      <div class="form-group">
        <label class="form-label">场景描述:</label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.description"
          placeholder="请输入场景描述"
        >
      </div>
      
      <div class="form-group">
        <label class="form-label">场景图片:</label>
        <div class="image-preview-container">
          <img 
            v-if="form.image" 
            :src="getImagePath(form.image)" 
            :alt="form.description || form.id"
            class="scene-image-preview"
            @click="openImageModal(getImagePath(form.image))"
          >
          <div v-else class="no-image">无图片</div>
          <button 
            v-if="form.image" 
            class="btn btn-secondary preview-button"
            @click="openImageModal(getImagePath(form.image))"
          >
            点击预览
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">图片显示模式:</label>
        <select v-model="form.imageDisplayMode" class="form-control">
          <option value="cover">覆盖 (Cover)</option>
          <option value="contain">包含 (Contain)</option>
          <option value="fill">填充 (Fill)</option>
        </select>
      </div>
      
      <div class="navigation-editor">
        <h4>导航设置</h4>
        <div class="navigation-grid">
          <div class="nav-direction up">
            <label>向上 (Up):</label>
            <select v-model="form.navigation.up" class="form-control">
              <option value="">无</option>
              <option v-for="scene in otherScenes" :key="scene.id" :value="scene.id">
                {{ scene.id }}
              </option>
            </select>
          </div>
          
          <div class="nav-direction left">
            <label>向左 (Left):</label>
            <select v-model="form.navigation.left" class="form-control">
              <option value="">无</option>
              <option v-for="scene in otherScenes" :key="scene.id" :value="scene.id">
                {{ scene.id }}
              </option>
            </select>
          </div>
          
          <div class="nav-direction right">
            <label>向右 (Right):</label>
            <select v-model="form.navigation.right" class="form-control">
              <option value="">无</option>
              <option v-for="scene in otherScenes" :key="scene.id" :value="scene.id">
                {{ scene.id }}
              </option>
            </select>
          </div>
          
          <div class="nav-direction down">
            <label>向下 (Down):</label>
            <select v-model="form.navigation.down" class="form-control">
              <option value="">无</option>
              <option v-for="scene in otherScenes" :key="scene.id" :value="scene.id">
                {{ scene.id }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveScene">保存场景</button>
        <button class="btn btn-secondary" @click="backToSelection">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue';
import { useStore } from 'vuex';
// @ts-ignore
import { indexedDBStorage } from '@/utils/indexedDBStorage';

export default {
  name: 'SceneEditor',
  setup() {
    const store = useStore();
    const currentScene = ref(null);
    const isImageModalOpen = ref(false);
    const modalImageSrc = ref('');
    const form = reactive({
      id: '',
      description: '',
      image: '',
      imageDisplayMode: 'cover',
      navigation: {
        up: '',
        down: '',
        left: '',
        right: ''
      }
    });
    
    // 获取所有场景
    const allScenes = computed(() => store.getters['scene/allScenes']);
    
    // 将场景对象转换为数组形式
    const allScenesArray = computed(() => {
      return Object.keys(allScenes.value).map(id => ({
        id,
        ...allScenes.value[id]
      }));
    });
    
    // 获取除当前场景外的其他场景（用于导航设置）
    const otherScenes = computed(() => {
      if (!currentScene.value) return allScenesArray.value;
      
      return allScenesArray.value.filter(scene => scene.id !== currentScene.value.id);
    });
    
    // 获取默认场景ID
    const defaultSceneId = computed(() => {
      return store.getters['scene/defaultScene'] || '';
    });
    
    // 更新默认场景
    const updateDefaultScene = async (event) => {
      const sceneId = event.target.value;
      await indexedDBStorage.setItem('defaultScene', sceneId || null);
      store.commit('scene/SET_DEFAULT_SCENE', sceneId || null);
    };
    
    // 选择场景进行编辑
    const selectScene = (sceneId) => {
      const scene = allScenes.value[sceneId];
      if (scene) {
        currentScene.value = { id: sceneId, ...scene };
        
        // 填充表单数据
        form.id = sceneId;
        form.description = scene.description || '';
        form.image = scene.image || '';
        form.imageDisplayMode = scene.imageDisplayMode || 'cover';
        form.navigation.up = scene.navigation?.up || '';
        form.navigation.down = scene.navigation?.down || '';
        form.navigation.left = scene.navigation?.left || '';
        form.navigation.right = scene.navigation?.right || '';
      }
    };
    
    // 返回场景选择
    const backToSelection = () => {
      currentScene.value = null;
      
      // 重置表单
      form.id = '';
      form.description = '';
      form.image = '';
      form.imageDisplayMode = 'cover';
      form.navigation.up = '';
      form.navigation.down = '';
      form.navigation.left = '';
      form.navigation.right = '';
    };
    
    // 保存场景
    const saveScene = () => {
      if (!form.id) {
        alert('场景ID不能为空!');
        return;
      }
      
      // 构造场景数据
      const sceneData = {
        id: form.id,
        description: form.description,
        image: form.image,
        imageDisplayMode: form.imageDisplayMode,
        navigation: { ...form.navigation }
      };
      
      // 调用Vuex action更新场景
      store.dispatch('scene/updateScene', sceneData);
      
      alert(`场景 "${form.id}" 更新成功!`);
      
      // 返回场景选择界面
      backToSelection();
    };
    
    // 获取图片路径
    const getImagePath = (imagePath) => {
      // 替换路径前缀以适配新的assets目录结构
      return imagePath.replace('images/', '/src/assets/images/');
    };
    
    // 打开图片预览模态框
    const openImageModal = (src) => {
      modalImageSrc.value = src;
      isImageModalOpen.value = true;
    };
    
    // 关闭图片预览模态框
    const closeImageModal = () => {
      isImageModalOpen.value = false;
      modalImageSrc.value = '';
    };
    
    // 设置默认场景（通过点击图标）
    const setDefaultScene = async (sceneId) => {
      // 如果点击的是当前默认场景，则取消默认设置
      const newDefaultSceneId = (sceneId === defaultSceneId.value) ? null : sceneId;
      
      await indexedDBStorage.setItem('defaultScene', newDefaultSceneId);
      store.commit('scene/SET_DEFAULT_SCENE', newDefaultSceneId);
      
      // 显示操作反馈
      if (newDefaultSceneId) {
        alert(`已将场景 "${sceneId}" 设为默认场景`);
      } else {
        alert('已取消默认场景设置');
      }
    };
    
    // 删除场景
    const deleteScene = async (sceneId) => {
      if (confirm(`确定要删除场景 "${sceneId}" 吗? 此操作不可恢复。`)) {
        try {
          // 从store中删除场景
          await store.dispatch('scene/removeScene', sceneId);
          
          // 如果删除的是默认场景，需要清除默认场景设置
          if (sceneId === defaultSceneId.value) {
            await indexedDBStorage.setItem('defaultScene', null);
            store.commit('scene/SET_DEFAULT_SCENE', null);
          }
          
          alert(`场景 "${sceneId}" 删除成功!`);
        } catch (error) {
          console.error('删除场景失败:', error);
          alert(`删除场景失败: ${error.message}`);
        }
      }
    };
    
    return {
      currentScene,
      isImageModalOpen,
      modalImageSrc,
      form,
      allScenesArray,
      otherScenes,
      defaultSceneId,
      updateDefaultScene,
      setDefaultScene,
      deleteScene,
      selectScene,
      backToSelection,
      saveScene,
      getImagePath,
      openImageModal,
      closeImageModal
    };
  }
};
</script>

<style scoped>
.scene-editor {
  padding: 20px;
}

.scene-editor h3 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.scene-editor h4 {
  color: #555;
  margin: 20px 0 15px 0;
}

.scene-selection {
  margin-bottom: 30px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.scene-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.scene-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.scene-image-preview {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  position: relative;
}

.scene-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.set-default-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 20px;
  color: #ccc;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.set-default-icon:hover {
  color: #ffcc00;
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.set-default-icon.active {
  color: #ffcc00;
  background: rgba(255, 255, 255, 0.9);
}

.delete-scene-icon {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 16px;
  color: #ccc;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-scene-icon:hover {
  color: #ff0000;
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.no-image {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 14px;
}

.scene-info {
  padding: 15px;
}

.scene-id {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.scene-description {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview-container .scene-image-preview {
  width: 200px;
  height: 150px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.image-preview-container .preview-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.image-preview-container .preview-button:hover {
  background: rgba(0, 0, 0, 0.9);
}

.navigation-editor {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.nav-direction {
  display: flex;
  flex-direction: column;
}

.nav-direction label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover {
  background-color: #616161;
}

/* 图片预览模态框样式 */
.image-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 35px;
  font-weight: bold;
  cursor: pointer;
  background: none;
  border: none;
}

.close-button:hover {
  color: #ccc;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  border: 3px solid white;
  border-radius: 4px;
}

/* 默认场景设置样式 */
.default-scene-settings {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.default-scene-settings h4 {
  margin-top: 0;
}

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.current-default, .no-default {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.current-default {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.no-default {
  background-color: #fff3e0;
  color: #ef6c00;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scene-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .navigation-grid {
    grid-template-columns: 1fr;
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>