<template>
  <div class="game-container">
    <SwiperSceneNavigator 
      ref="sceneManager" 
      :scenes="allScenes"
      @scene-change="onSceneChange"
      @update-history="updateHistory"
    />
    
    <!-- 热点管理器 -->
    <HotspotManager 
      v-if="currentSceneId"
      :current-scene-id="currentSceneId"
      :is-editing="false"
      @hotspot-click="handleHotspotClick"
    />
    
    <!-- 导航箭头 -->
    <div class="navigation">
      <div 
        v-if="currentSceneNavigation && currentSceneNavigation.left" 
        class="nav-arrow left-arrow" 
        @click="navigate('left')"
      >
        ←
      </div>
      <div 
        v-if="currentSceneNavigation && currentSceneNavigation.right" 
        class="nav-arrow right-arrow" 
        @click="navigate('right')"
      >
        →
      </div>
      <div 
        v-if="currentSceneNavigation && currentSceneNavigation.up" 
        class="nav-arrow up-arrow" 
        @click="navigate('up')"
      >
        ↑
      </div>
      <div 
        v-if="currentSceneNavigation && currentSceneNavigation.down" 
        class="nav-arrow down-arrow" 
        @click="navigate('down')"
      >
        ↓
      </div>
    </div>
    
    <!-- 显示模式切换按钮 -->
    <div class="display-mode-toggle" @click="toggleDisplayMode" title="切换图片显示模式">⤦</div>
    
    <!-- 返回按钮 -->
    <div class="home-return-btn" @click="goHome" title="返回首页">🏠</div>
    <div class="back-btn" :class="{ hidden: history.length <= 1 }" @click="goBack" title="返回上一个场景">↩</div>
    
    <!-- 信息提示框 -->
    <div v-if="showInfoModal" class="info-modal" @click="closeInfoModal">
      <div class="info-modal-content" @click.stop>
        <div class="info-modal-text">{{ infoContent }}</div>
        <button class="info-modal-close" @click="closeInfoModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
// @ts-ignore
import { useStore } from 'vuex';
import SwiperSceneNavigator from './SwiperSceneNavigator.vue';
import HotspotManager from './HotspotManager.vue';

export default {
  name: 'GameContainer',
  components: {
    SwiperSceneNavigator,
    HotspotManager
  },
  setup() {
    // @ts-ignore
    const store = useStore();
    const sceneManager = ref(null);
    const history = ref([]); // 默认为空数组
    const showInfoModal = ref(false);
    const infoContent = ref('');
    let displayModes = ['cover', 'contain', 'fill'];
    let currentModeIndex = 0;

    // 获取所有场景
    const allScenes = computed(() => {
      return store.getters['scene/allScenes'] || {};
    });

    // 计算当前场景ID
    const currentSceneId = computed(() => {
      if (!sceneManager.value) return null;
      return sceneManager.value.currentSceneId;
    });

    // 计算当前场景的导航设置
    const currentSceneNavigation = computed(() => {
      if (!sceneManager.value || !currentSceneId.value) return null;
      
      const sceneData = sceneManager.value.getSceneData(currentSceneId.value);
      return sceneData?.navigation || null;
    });

    // 处理场景切换事件
    const onSceneChange = (sceneId) => {
      // 添加到历史记录（避免重复添加）
      if (history.value[history.value.length - 1] !== sceneId) {
        history.value.push(sceneId);
      }
    };

    // 更新历史记录
    const updateHistory = (sceneId) => {
      // 添加到历史记录（避免重复添加）
      if (history.value[history.value.length - 1] !== sceneId) {
        history.value.push(sceneId);
      }
    };

    // 处理热点点击事件
    const handleHotspotClick = (hotspot) => {
      switch (hotspot.type) {
        case 'navigation':
          // 导航到目标场景
          if (hotspot.targetScene && sceneManager.value) {
            // 确保目标场景存在
            if (sceneManager.value.getSceneData(hotspot.targetScene)) {
              // 添加到历史记录
              history.value.push(hotspot.targetScene);
              // 使用Vuex action切换场景
              store.dispatch('scene/switchScene', hotspot.targetScene);
              
              // 使用Swiper API进行场景切换
              const scenes = Object.keys(allScenes.value);
              const index = scenes.indexOf(hotspot.targetScene);
              if (index >= 0) {
                sceneManager.value.goToSlide(index);
              }
            }
          }
          break;
          
        case 'info':
          // 显示信息内容
          infoContent.value = hotspot.infoContent || '无内容';
          showInfoModal.value = true;
          break;
          
        case 'action':
          // 执行动作（这里可以扩展更多功能）
          console.log('执行动作:', hotspot);
          break;
          
        default:
          console.log('未知热点类型:', hotspot.type);
      }
    };

    // 关闭信息提示框
    const closeInfoModal = () => {
      showInfoModal.value = false;
      infoContent.value = '';
    };

    // 切换显示模式
    const toggleDisplayMode = () => {
      if (currentSceneId.value) {
        // 获取当前场景数据
        const sceneData = allScenes.value[currentSceneId.value];
        if (sceneData && sceneData.image) {
          // 定义显示模式循环数组
          const displayModes = ['cover', 'contain', 'fill'];
          
          // 获取当前显示模式
          const currentMode = sceneData.imageDisplayMode || 'cover';
          
          // 计算下一个显示模式
          const currentIndex = displayModes.indexOf(currentMode);
          const nextIndex = (currentIndex + 1) % displayModes.length;
          const nextMode = displayModes[nextIndex];
          
          // 直接更新场景数据中的显示模式
          sceneData.imageDisplayMode = nextMode;
          
          console.log(`显示模式已切换: ${currentMode} -> ${nextMode}`);
        }
      }
    };

    // 导航功能
    const navigate = (direction) => {
      if (!sceneManager.value) return;
      
      const scenes = Object.keys(allScenes.value);
      const currentIndex = scenes.indexOf(currentSceneId.value);
      
      if (currentSceneNavigation.value && currentSceneNavigation.value[direction]) {
        const targetScene = currentSceneNavigation.value[direction];
        const index = scenes.indexOf(targetScene);
        if (index >= 0) {
          sceneManager.value.goToSlide(index);
        }
      }
    };

    // 返回首页
    const goHome = async () => {
      // 重置历史记录
      history.value = [];
      
      // 获取默认场景
      try {
        // @ts-ignore
        const defaultSceneId = await indexedDBStorage.getItem('defaultScene');
        if (defaultSceneId) {
          // 如果有默认场景，添加到历史记录
          history.value.push(defaultSceneId);
          // 使用SwiperSceneNavigator切换到默认场景
          if (sceneManager.value) {
            const scenes = Object.keys(allScenes.value);
            const index = scenes.indexOf(defaultSceneId);
            if (index >= 0) {
              sceneManager.value.goToSlide(index);
              return;
            }
          }
        }
      } catch (error) {
        console.error('获取默认场景失败:', error);
      }
      
      // 如果没有默认场景或默认场景不存在，则回到第一个场景
      const scenes = Object.keys(allScenes.value);
      if (scenes.length > 0) {
        history.value.push(scenes[0]);
        if (sceneManager.value) {
          sceneManager.value.goToSlide(0);
        }
      }
    };

    // 返回上一个场景
    const goBack = () => {
      if (history.value.length <= 1) return;
      
      // 移除当前场景
      history.value.pop();
      // 获取上一个场景
      const previousScene = history.value[history.value.length - 1];
      
      if (sceneManager.value && previousScene) {
        // 使用SwiperSceneNavigator切换到上一个场景
        const scenes = Object.keys(allScenes.value);
        const index = scenes.indexOf(previousScene);
        if (index >= 0) {
          sceneManager.value.goToSlide(index);
        }
      } else if (!previousScene) {
        // 如果没有上一个场景，则回到首页状态
        history.value = [];
      }
    };

    return {
      sceneManager,
      history,
      showInfoModal,
      infoContent,
      allScenes,
      currentSceneId,
      currentSceneNavigation,
      onSceneChange,
      updateHistory,
      handleHotspotClick,
      closeInfoModal,
      toggleDisplayMode,
      navigate,
      goHome,
      goBack
    };
  }
};
</script>

<style scoped>
/* 游戏容器设置为全屏 */
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #111;
  overflow: hidden;
}

/* 导航箭头样式 */
.nav-arrow {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s;
  font-size: 24px;
  border-radius: 50%;
}

.nav-arrow:hover {
  background-color: rgba(50, 50, 50, 0.8);
}

.left-arrow {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.right-arrow {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.up-arrow {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.down-arrow {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* 显示模式切换按钮 */
.display-mode-toggle {
  position: absolute;
  bottom: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s, transform 0.2s;
}

.display-mode-toggle:hover {
  background-color: rgba(50, 50, 50, 0.8);
  transform: scale(1.1);
}

/* 返回首页按钮 */
.home-return-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s, transform 0.2s;
}

.home-return-btn:hover {
  background-color: rgba(50, 50, 50, 0.8);
  transform: scale(1.1);
}

/* 返回上一个场景按钮 */
.back-btn {
  position: absolute;
  top: 15px;
  left: 70px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s, transform 0.2s;
}

.back-btn:hover {
  background-color: rgba(50, 50, 50, 0.8);
  transform: scale(1.1);
}

.back-btn.hidden {
  display: none;
}
</style>