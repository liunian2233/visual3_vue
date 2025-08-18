<template>
  <div class="scene" :class="sceneClass" :style="sceneStyle">
    <!-- 场景内容将在这里渲染 -->
    <div v-if="currentSceneData" class="scene-description">
      {{ currentSceneData.description }}
    </div>
    <!-- 当没有场景时显示提示信息 -->
    <div v-else-if="!loading" class="no-scene-message">
      未添加考试
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
// @ts-ignore
import { useStore } from 'vuex';
// @ts-ignore
import { indexedDBStorage } from '@/utils/indexedDBStorage';

// 定义场景数据接口
interface SceneData {
  image?: string;
  imageDisplayMode?: string;
  description?: string;
  navigation?: {
    right: string | null;
    left: string | null;
    up: string | null;
    down: string | null;
  };
}

// 定义场景管理器接口
interface SceneManager {
  currentScene: string;
  scenes: Record<string, SceneData>;
  currentDisplayMode: string;
}

export default defineComponent({
  name: 'SceneManager',
  props: {
    examMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['sceneChange'],
  setup(props, { emit }) {
    const store = useStore();
    const loading = ref(true); // 添加加载状态
    
    // 使用Composition API重构数据管理
    const sceneManager = ref<SceneManager>({
      currentScene: '', // 不设置默认场景
      scenes: {},
      currentDisplayMode: 'cover'
    });

    // 计算当前场景数据
    const currentSceneData = computed(() => {
      // 如果没有当前场景或者场景不存在，返回null
      if (!sceneManager.value.currentScene || !sceneManager.value.scenes[sceneManager.value.currentScene]) {
        return null;
      }
      return sceneManager.value.scenes[sceneManager.value.currentScene] || null;
    });

    // 计算场景类
    const sceneClass = computed(() => {
      return {
        'scene-with-bg-image': currentSceneData.value && currentSceneData.value.image,
        [sceneManager.value.currentDisplayMode]: currentSceneData.value && currentSceneData.value.image
      };
    });

    // 计算场景样式
    const sceneStyle = computed(() => {
      if (currentSceneData.value && currentSceneData.value.image) {
        // 使用新的assets目录路径
        const imagePath = currentSceneData.value.image.replace('images/', '/src/assets/images/');
        return {
          backgroundImage: `url(${imagePath})`
        };
      }
      return {};
    });

    // 初始化场景
    const initializeScenes = async () => {
      loading.value = true; // 开始加载
      try {
        // 从Vuex store获取所有场景
        const scenes = store.getters['scene/allScenes'];
        sceneManager.value.scenes = scenes || {};
        
        console.log('Loaded scenes:', scenes);
        
        // 不再自动创建默认场景
        // 检查是否有默认场景设置
        const defaultSceneId = await indexedDBStorage.getItem('defaultScene');
        
        if (defaultSceneId && sceneManager.value.scenes[defaultSceneId]) {
          // 如果设置了默认场景且该场景存在，则使用默认场景
          sceneManager.value.currentScene = defaultSceneId;
        } else {
          // 否则设置当前场景为第一个可用场景（如果有的话）
          const sceneIds = Object.keys(sceneManager.value.scenes);
          if (sceneIds.length > 0) {
            sceneManager.value.currentScene = sceneIds[0];
          }
        }
        
        console.log('Current scene set to:', sceneManager.value.currentScene);
        
        // 触发场景变更事件
        if (sceneManager.value.currentScene) {
          emit('sceneChange', sceneManager.value.currentScene);
        }
      } finally {
        loading.value = false; // 加载完成
      }
    };

    // 初始化场景管理器
    const initializeSceneManager = async () => {
      // 初始化场景
      await initializeScenes();
    };
    
    // 切换场景
    const switchScene = (sceneId: string) => {
      if (sceneManager.value.scenes[sceneId]) {
        sceneManager.value.currentScene = sceneId;
        sceneManager.value.currentDisplayMode = sceneManager.value.scenes[sceneId].imageDisplayMode || 'cover';
        emit('sceneChange', sceneId);
      }
    };

    // 设置显示模式
    const setDisplayMode = (mode: string) => {
      if (['cover', 'contain', 'fill'].includes(mode)) {
        sceneManager.value.currentDisplayMode = mode;
      }
    };

    // 获取当前场景
    const getCurrentScene = () => {
      return sceneManager.value.currentScene;
    };

    // 获取场景数据
    const getSceneData = (sceneId: string) => {
      return sceneManager.value.scenes[sceneId];
    };

    // 监听考试模式变化
    watch(
      () => props.examMode,
      async (newMode) => {
        // 如果进入考试模式，重新加载场景
        if (newMode) {
          await initializeSceneManager();
        }
      }
    );

    // 挂载时初始化
    onMounted(async () => {
      // 等待状态恢复完成后再初始化场景
      await store.waitForStateRestore();
      await initializeSceneManager();
    });

    // 监听场景变化
    watch(
      () => sceneManager.value.currentScene,
      (newSceneId) => {
        emit('sceneChange', newSceneId);
      }
    );

    // 暴露给模板使用的属性和方法
    return {
      loading, // 暴露loading状态
      sceneManager,
      currentSceneData,
      sceneClass,
      sceneStyle,
      switchScene,
      setDisplayMode,
      getCurrentScene,
      getSceneData
    };
  }
});
</script>

<style scoped>
.scene {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.scene-with-bg-image {
  background-size: contain !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-color: #000 !important;
}

.scene-with-bg-image.cover {
  background-size: cover !important;
}

.scene-with-bg-image.contain {
  background-size: contain !important;
}

.scene-with-bg-image.fill {
  background-size: 100% 100% !important;
}

.scene-description {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 5px;
  max-width: 80%;
}

.no-scene-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  text-align: center;
  width: 100%;
}
</style>