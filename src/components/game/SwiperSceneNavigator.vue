<template>
  <div class="swiper-scene-navigator">
    <swiper
      v-if="sceneOrder.length > 0"
      :modules="swiperModules"
      :slides-per-view="1"
      :space-between="0"
      :initial-slide="initialSlideIndex"
      :scrollbar="{ draggable: true, hide: false }"
      @swiper="onSwiperInit"
      @slideChange="onSlideChange"
      class="scene-swiper"
    >
      <swiper-slide 
        v-for="sceneId in sceneOrder" 
        :key="sceneId"
        class="scene-slide"
      >
        <div 
          class="scene" 
          :class="getSceneClass(sceneId)" 
          :style="getSceneStyle(sceneId)"
        >
          <div v-if="getSceneData(sceneId)" class="scene-description">
            {{ getSceneData(sceneId).description }}
          </div>
        </div>
      </swiper-slide>
    </swiper>
    
    <!-- 无场景提示 -->
    <div v-else class="no-scene-message">
      未添加考试
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
// @ts-ignore
import { useStore } from 'vuex';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Scrollbar } from 'swiper/modules';
// @ts-ignore
import { indexedDBStorage } from '@/utils/indexedDBStorage';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

export default {
  name: 'SwiperSceneNavigator',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    scenes: {
      type: Object,
      required: true
    }
  },
  emits: ['scene-change', 'update-history'],
  setup(props, { emit }) {
    // @ts-ignore
    const store = useStore();
    const swiperInstance = ref(null);
    const currentSlideIndex = ref(0);
    
    // Swiper modules
    const swiperModules = [Navigation, Scrollbar];
    
    // 场景顺序 - 根据对象键排序
    const sceneOrder = computed(() => {
      return Object.keys(props.scenes);
    });
    
    // 当前场景ID
    const currentSceneId = computed(() => {
      if (sceneOrder.value.length === 0) return null;
      return sceneOrder.value[currentSlideIndex.value] || null;
    });
    
    // 初始幻灯片索引
    const initialSlideIndex = computed(() => {
      // 获取当前场景ID
      const currentScene = store.state.scene.currentScene;
      if (currentScene) {
        const index = sceneOrder.value.indexOf(currentScene);
        return index >= 0 ? index : 0;
      }
      return 0;
    });
    
    // 是否是第一个幻灯片
    const isFirstSlide = computed(() => {
      return currentSlideIndex.value === 0;
    });
    
    // 是否是最后一个幻灯片
    const isLastSlide = computed(() => {
      return currentSlideIndex.value === sceneOrder.value.length - 1;
    });
    
    // 获取场景数据
    const getSceneData = (sceneId) => {
      return props.scenes[sceneId];
    };
    
    // 获取场景类
    const getSceneClass = (sceneId) => {
      const sceneData = getSceneData(sceneId);
      const displayMode = sceneData?.imageDisplayMode || 'cover';
      
      return {
        'scene-with-bg-image': sceneData && sceneData.image,
        [displayMode]: sceneData && sceneData.image
      };
    };
    
    // 获取场景样式
    const getSceneStyle = (sceneId) => {
      const sceneData = getSceneData(sceneId);
      if (sceneData && sceneData.image) {
        // 使用新的assets目录路径
        const imagePath = sceneData.image.replace('images/', '/src/assets/images/');
        return {
          backgroundImage: `url(${imagePath})`
        };
      }
      return {};
    };
    
    // Swiper初始化
    const onSwiperInit = (swiper) => {
      swiperInstance.value = swiper;
      // 设置初始索引
      currentSlideIndex.value = swiper.activeIndex;
      
      // 如果有当前场景，触发场景变更事件
      if (currentSceneId.value) {
        emit('scene-change', currentSceneId.value);
        emit('update-history', currentSceneId.value);
      }
    };
    
    // 幻灯片切换
    const onSlideChange = (swiper) => {
      currentSlideIndex.value = swiper.activeIndex;
      if (currentSceneId.value) {
        // 使用Vuex action切换场景
        store.dispatch('scene/switchScene', currentSceneId.value);
        emit('scene-change', currentSceneId.value);
      }
    };
    
    // 跳转到上一个幻灯片
    const goToPrevSlide = () => {
      if (swiperInstance.value) {
        swiperInstance.value.slidePrev();
      }
    };
    
    // 跳转到下一个幻灯片
    const goToNextSlide = () => {
      if (swiperInstance.value) {
        swiperInstance.value.slideNext();
      }
    };
    
    // 跳转到指定幻灯片
    const goToSlide = (index) => {
      if (swiperInstance.value) {
        swiperInstance.value.slideTo(index);
      }
    };
    
    // 监听Vuex中的当前场景变化
    watch(
      () => store.state.scene.currentScene,
      (newSceneId) => {
        if (newSceneId) {
          const index = sceneOrder.value.indexOf(newSceneId);
          if (index >= 0 && swiperInstance.value) {
            // 更新Swiper到对应幻灯片
            swiperInstance.value.slideTo(index, 0); // 0表示无动画切换
          }
        }
      }
    );
    
    return {
      swiperModules,
      sceneOrder,
      currentSceneId,
      initialSlideIndex,
      currentSlideIndex,
      isFirstSlide,
      isLastSlide,
      getSceneData,
      getSceneClass,
      getSceneStyle,
      onSwiperInit,
      onSlideChange,
      goToPrevSlide,
      goToNextSlide,
      goToSlide
    };
  }
};
</script>

<style scoped>
.swiper-scene-navigator {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-swiper {
  width: 100%;
  height: 100%;
}

.scene-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

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
  z-index: 1;
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

/* Swiper scrollbar styles */
:global(.swiper-scrollbar) {
  position: absolute;
  bottom: 30px;
  left: 50%;
  width: 80%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  z-index: 10;
}

:global(.swiper-scrollbar-drag) {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
}
</style>