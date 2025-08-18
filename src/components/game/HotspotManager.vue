<template>
  <div class="hotspot-manager">
    <!-- 直接使用SVG容器，移除hotspot-wrapper -->
    <svg 
      class="hotspot-svg"
      width="100%" 
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g 
        v-for="hotspot in validHotspots" 
        :key="hotspot.id"
        class="hotspot-group"
        @mouseenter="showTooltip(hotspot, $event)"
        @mouseleave="hideTooltip"
      >
        <polygon 
          :points="getPolygonPoints(hotspot.points)" 
          :class="['hotspot-polygon', hotspot.type]"
          @click="handleHotspotClick($event, hotspot)"
          @touchstart="handleHotspotClick($event, hotspot)"
        />
      </g>
    </svg>
    <!-- 自定义Tooltip -->
    <Tooltip
      v-if="tooltipContent"
      :content="tooltipContent"
      :position="tooltipPosition"
      :position-type="tooltipPositionType"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import Tooltip from '@/components/ui/Tooltip.vue';

export default {
  name: 'HotspotManager',
  components: {
    Tooltip
  },
  props: {
    currentSceneId: {
      type: String,
      required: true
    }
  },
  emits: ['hotspot-click'],
  setup(props, { emit }) {
    const store = useStore();
    
    // 获取当前场景的热点
    const hotspots = computed(() => {
      if (!props.currentSceneId) {
        console.log('No current scene ID provided');
        return [];
      }
      
      const sceneHotspots = store.getters['hotspot/getHotspotsByScene'](props.currentSceneId);
      console.log('Retrieved hotspots for scene', props.currentSceneId, sceneHotspots);
      return sceneHotspots;
    });
    
    // 过滤有效的热点（非null/undefined，并且包含id属性）
    const validHotspots = computed(() => {
      const valid = Array.isArray(hotspots.value) ? hotspots.value.filter(hotspot => hotspot && hotspot.id) : [];
      console.log('Valid hotspots:', valid);
      return valid;
    });

    // 获取多边形点字符串
    const getPolygonPoints = (points) => {
      if (!points || points.length === 0) return '';
      return points.map(point => `${point.x},${point.y}`).join(' ');
    };

    // Tooltip相关
    const tooltipContent = ref('');
    const tooltipPosition = ref({ x: 0, y: 0 });
    const tooltipPositionType = ref('top');
    const tooltipTimeout = ref(null);
    
    // 监听hide-tooltip事件
    const handleHideTooltip = () => {
      hideTooltip();
    };
    
    // 组件挂载时添加事件监听器
    onMounted(() => {
      window.addEventListener('hide-tooltip', handleHideTooltip);
    });
    
    // 组件卸载时移除事件监听器
    onUnmounted(() => {
      window.removeEventListener('hide-tooltip', handleHideTooltip);
      // 确保在组件卸载时清除定时器
      if (tooltipTimeout.value) {
        clearTimeout(tooltipTimeout.value);
      }
    });
    
    // 显示Tooltip
    const showTooltip = (hotspot, event) => {
      console.log('showTooltip called with hotspot:', hotspot);
      console.log('Event type:', event.type);
      console.log('Event target:', event.target);
      console.log('Event clientX/Y:', event.clientX, event.clientY);
      
      if (!hotspot.description) {
        console.log('Hotspot has no description:', hotspot);
        return;
      }
      
      // 获取目标元素（polygon）的位置信息
      const target = event.target;
      const rect = target.getBoundingClientRect();
      
      // 计算Tooltip位置（显示在热点区域上方中央）
      tooltipPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.top - 20 // 稍微向上偏移
      };
      tooltipContent.value = hotspot.description;
      tooltipPositionType.value = 'top';
      
      // 设置延迟显示
      if (tooltipTimeout.value) {
        clearTimeout(tooltipTimeout.value);
      }
      tooltipTimeout.value = setTimeout(() => {
        console.log('Setting tooltip content:', hotspot.description);
        tooltipContent.value = hotspot.description;
      }, 300);
    };
    
    // 隐藏Tooltip
    const hideTooltip = () => {
      console.log('hideTooltip called');
      if (tooltipTimeout.value) {
        clearTimeout(tooltipTimeout.value);
        tooltipTimeout.value = null;
      }
      tooltipContent.value = '';
    };

    // Tooltip内容变更监听
    watch(tooltipContent, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        console.log('Tooltip content changed:', newVal);
        // 可以在这里执行其他操作，例如发送埋点、更新状态等
      }
    });

    // 获取SVG坐标
    const getSVGPoint = (event, svg) => {
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      // 转换为客户坐标到SVG坐标
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      // 确保坐标在0-100范围内
      return {
        x: Math.max(0, Math.min(100, svgP.x)),
        y: Math.max(0, Math.min(100, svgP.y))
      };
    };

    // 检查点是否在多边形内
    const isPointInPolygon = (point, polygonPoints) => {
      if (!polygonPoints || polygonPoints.length < 3) return false;

      let x = point.x, y = point.y;
      let inside = false;

      for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
        let xi = polygonPoints[i].x, yi = polygonPoints[i].y;
        let xj = polygonPoints[j].x, yj = polygonPoints[j].y;

        let intersect = ((yi > y) !== (yj > y)) && 
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      return inside;
    };
    
    // 处理热点点击
    const handleHotspotClick = (event, hotspot) => {
      // 防止事件冒泡
      event.stopPropagation();
      
      // 阻止默认行为，特别是触摸事件
      event.preventDefault();

      // 获取SVG元素
      const svg = event.currentTarget.closest('svg');
      if (!svg) return;

      // 获取点击坐标并转换为SVG坐标
      // 对于触摸事件，需要从touches中获取坐标
      let clientX, clientY;
      if (event.type === 'touchstart' && event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        // 鼠标事件
        clientX = event.clientX;
        clientY = event.clientY;
      }

      // 创建SVG点并转换坐标
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      
      // 转换为客户坐标到SVG坐标
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      // 确保坐标在0-100范围内
      const { x, y } = {
        x: Math.max(0, Math.min(100, svgP.x)),
        y: Math.max(0, Math.min(100, svgP.y))
      };

      // 检查点击是否在热点区域内
      if (hotspot.points && isPointInPolygon({ x, y }, hotspot.points)) {
        console.log('Hotspot clicked:', hotspot);
        emit('hotspot-click', hotspot);
      }
    };
    
    // 添加调试信息
    console.log('HotspotManager initialized with scene ID:', props.currentSceneId);
    console.log('All hotspot state:', store.state.hotspot);
    
    return {
      validHotspots,
      handleHotspotClick,
      getPolygonPoints,
      // Tooltip相关
      tooltipContent,
      tooltipPosition,
      tooltipPositionType,
      showTooltip,
      hideTooltip
    };
  }
};
</script>

<style scoped>
.hotspot-manager {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.hotspot-svg {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.hotspot-group {
  pointer-events: auto;
}

.hotspot-polygon {
  fill: rgba(25, 118, 210, 0.2);
  stroke: #1976d2;
  stroke-width: 0.5;
  cursor: pointer;
}

.hotspot-polygon:hover {
  fill: rgba(25, 118, 210, 0.3);
}
</style>