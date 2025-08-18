<template>
  <div 
    class="hotspot"
    :class="hotspot && hotspot.type || ''"
    :style="hotspotStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 热点图标 -->
    <div class="hotspot-icon">
      <span v-if="hotspot && hotspot.type === 'navigation'">🔗</span>
      <span v-else-if="hotspot && hotspot.type === 'info'">ℹ️</span>
      <span v-else-if="hotspot && hotspot.type === 'action'">⚡</span>
    </div>
    
    <!-- 信息提示框 -->
    <div v-if="showTooltip && hotspot && (hotspot.description || hotspot.infoContent || hotspot.targetScene)" class="hotspot-tooltip">
      <div v-if="hotspot.type === 'info'">
        {{ hotspot.description || hotspot.infoContent || '信息热点' }}
      </div>
      <div v-else-if="hotspot.type === 'navigation'">
        {{ hotspot.description || `导航至: ${hotspot.targetScene}` || '导航热点' }}
      </div>
      <div v-else-if="hotspot.type === 'action'">
        {{ hotspot.description || '动作热点' }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'Hotspot',
  props: {
    hotspot: {
      type: Object,
      required: false,
      default: () => null
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const showTooltip = ref(false);
    
    // 热点样式
    const hotspotStyle = computed(() => {
      if (!props.hotspot) {
        return {
          left: '0%',
          top: '0%',
          width: '0%',
          height: '0%'
        };
      }
      
      // 如果是多边形热点，计算边界框
      if (props.hotspot.points && Array.isArray(props.hotspot.points)) {
        if (props.hotspot.points.length === 0) {
          return {
            left: '0%',
            top: '0%',
            width: '0%',
            height: '0%'
          };
        }
        
        // 计算所有点的边界框
        let minX = Math.min(...props.hotspot.points.map(p => p.x));
        let maxX = Math.max(...props.hotspot.points.map(p => p.x));
        let minY = Math.min(...props.hotspot.points.map(p => p.y));
        let maxY = Math.max(...props.hotspot.points.map(p => p.y));
        
        return {
          left: minX + '%',
          top: minY + '%',
          width: (maxX - minX) + '%',
          height: (maxY - minY) + '%'
        };
      }
      
      // 默认矩形热点
      return {
        left: (props.hotspot.x || 0) + '%',
        top: (props.hotspot.y || 0) + '%',
        width: (props.hotspot.width || 0) + '%',
        height: (props.hotspot.height || 0) + '%'
      };
    });
    
    // 处理点击事件
    const handleClick = () => {
      if (props.hotspot) {
        console.log('Hotspot clicked in component:', props.hotspot);
        emit('click', props.hotspot);
      }
    };
    
    // 处理鼠标进入事件
    const handleMouseEnter = () => {
      // 所有类型的热点都显示提示框（如果有描述信息）
      if (props.hotspot && (props.hotspot.description || props.hotspot.infoContent || props.hotspot.targetScene)) {
        showTooltip.value = true;
      }
    };
    
    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      showTooltip.value = false;
    };
    
    return {
      showTooltip,
      hotspotStyle,
      handleClick,
      handleMouseEnter,
      handleMouseLeave
    };
  }
};
</script>

<style scoped>
.hotspot {
  position: absolute;
  border: 2px solid #1976d2;
  background-color: rgba(25, 118, 210, 0.2);
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto; /* 确保热点可以接收事件 */
}

.hotspot:hover {
  background-color: rgba(25, 118, 210, 0.3);
}

.hotspot.navigation {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.2);
}

.hotspot.info {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.2);
}

.hotspot.action {
  border-color: #f57c00;
  background-color: rgba(245, 124, 0, 0.2);
}

.hotspot-icon {
  font-size: 16px;
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.hotspot-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.hotspot-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}
</style>