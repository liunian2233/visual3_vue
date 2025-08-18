<template>
  <teleport to="body">
    <transition name="tooltip-fade">
      <div 
        v-if="tooltipContent" 
        class="tooltip-container"
        :style="tooltipStyle"
        :class="positionType"
      >
        <div class="tooltip-content">{{ tooltipContent }}</div>
        <div class="tooltip-arrow"></div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { computed, ref, watch } from 'vue';

export default {
  name: 'Tooltip',
  props: {
    content: {
      type: String,
      default: ''
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    positionType: {
      type: String,
      default: 'top',
      validator: value => ['top', 'bottom', 'left', 'right'].includes(value)
    }
  },
  setup(props) {
    // 创建响应式tooltipContent
    const tooltipContent = ref(props.content);
    
    // 监听props.content的变化
    watch(() => props.content, (newVal) => {
      tooltipContent.value = newVal;
    });
    
    // 计算tooltip样式
    const tooltipStyle = computed(() => {
      return {
        position: 'absolute',
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'opacity 0.3s, transform 0.3s',
        transform: 'translate(-50%, -50%)',
        //确保tooltip至少有1px的透明度，避免完全透明
        opacity: props.content ? 1 : 0
      };
    });

    return {
      tooltipStyle,
      tooltipContent
    };
  }
};
</script>

<style scoped>
.tooltip-container {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;
  transform: translate(-50%, -50%);
  opacity: 1;
}

.tooltip-container.top {
  transform: translate(-50%, -100%);
}

.tooltip-container.bottom {
  transform: translate(-50%, 0);
}

.tooltip-container.left {
  transform: translate(-100%, -50%);
}

.tooltip-container.right {
  transform: translate(0, -50%);
}

.tooltip-content {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 9999;
  pointer-events: none;
  min-width: 20px;
  min-height: 20px;
}

.tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  z-index: 9998;
  display: block;
}

/* 顶部箭头 */
.tooltip-container.top .tooltip-arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

/* 底部箭头 */
.tooltip-container.bottom .tooltip-arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
}

/* 左侧箭头 */
.tooltip-container.left .tooltip-arrow {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.8);
}

/* 右侧箭头 */
.tooltip-container.right .tooltip-arrow {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent rgba(0, 0, 0, 0.8) transparent transparent;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.3s;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>