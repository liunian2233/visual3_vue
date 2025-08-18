<template>
  <div class="display-mode-toggle" @click="toggleMode" :title="tooltip">
    {{ currentModeSymbol }}
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { SCENE_DISPLAY_MODES } from '../../utils/constants';

export default {
  name: 'DisplayModeToggle',
  props: {
    currentMode: {
      type: String,
      default: SCENE_DISPLAY_MODES.COVER
    }
  },
  emits: ['mode-change'],
  setup(props, { emit }) {
    // 显示模式列表
    const modes = [
      SCENE_DISPLAY_MODES.COVER,
      SCENE_DISPLAY_MODES.CONTAIN,
      SCENE_DISPLAY_MODES.FILL
    ];
    
    // 当前模式索引
    const currentModeIndex = computed(() => {
      return modes.indexOf(props.currentMode);
    });
    
    // 当前模式符号
    const currentModeSymbol = computed(() => {
      const symbols = {
        [SCENE_DISPLAY_MODES.COVER]: 'C',
        [SCENE_DISPLAY_MODES.CONTAIN]: 'I',
        [SCENE_DISPLAY_MODES.FILL]: 'F'
      };
      return symbols[props.currentMode] || 'C';
    });
    
    // 工具提示
    const tooltip = computed(() => {
      const tooltips = {
        [SCENE_DISPLAY_MODES.COVER]: '覆盖模式 (Cover)',
        [SCENE_DISPLAY_MODES.CONTAIN]: '包含模式 (Contain)',
        [SCENE_DISPLAY_MODES.FILL]: '填充模式 (Fill)'
      };
      return tooltips[props.currentMode] || '切换显示模式';
    });
    
    // 切换模式
    const toggleMode = () => {
      const nextIndex = (currentModeIndex.value + 1) % modes.length;
      emit('mode-change', modes[nextIndex]);
    };
    
    return {
      currentModeSymbol,
      tooltip,
      toggleMode
    };
  }
};
</script>

<style scoped>
.display-mode-toggle {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 18px;
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
</style>