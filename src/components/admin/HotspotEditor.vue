<template>
  <div class="admin-hotspot-editor">
    <h3>热点编辑</h3>
    
    <!-- 选择场景 -->
    <div class="scene-selection" v-if="!selectedSceneId">
      <h4>选择场景</h4>
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
          </div>
          <div class="scene-info">
            <div class="scene-id">{{ scene.id }}</div>
            <div class="scene-description">{{ scene.description || '无描述' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 热点编辑界面 -->
    <div v-else class="hotspot-edit-area" ref="hotspotEditArea">
      <div class="editor-header">
        <button @click="backToSceneSelection" class="btn btn-secondary">返回场景选择</button>
        <h4>场景: {{ selectedSceneId }}</h4>
      </div>
      
      <div class="hotspot-editor-content">
        <!-- 图片预览区域 -->
        <div class="image-preview-container">
          <div 
            class="image-wrapper" 
            @click="handleImageClick" 
            @touchstart="handleImageClick"
            ref="imageWrapper"
          >
            <img 
              :src="selectedSceneImage" 
              :alt="selectedSceneDescription"
              class="preview-image"
              ref="previewImage"
              @load="onImageLoad"
            >
            <!-- 显示现有热点 -->
            <svg 
              class="hotspot-svg" 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              ref="hotspotSvg"
            >
              <g v-for="(hotspot, index) in sceneHotspots" :key="hotspot.id">
                <polygon 
                  :points="getPolygonPointsForSVG(hotspot.points)" 
                  class="hotspot-polygon"
                  @mouseenter="showTooltip(hotspot, $event)"
                  @mouseleave="hideTooltip"
                  @click="handleHotspotClick"
                  @touchstart="handleHotspotClick"
                />
              </g>
              
              <!-- 显示正在绘制的热点 -->
              <g v-if="isDrawing">
                <polyline 
                  v-if="currentPoints.length > 0"
                  :points="getDrawingPointsForSVG()" 
                  class="drawing-line"
                  fill="none"
                />
                <polygon 
                  v-if="currentPoints.length > 2"
                  :points="getPolygonPointsForSVG(currentPoints)" 
                  class="drawing-polygon"
                />
                <!-- 显示绘制点 -->
                <g v-for="(point, index) in currentPoints" :key="index">
                  <!-- 点的外圈，增加可见性 -->
                  <circle
                    :cx="point.x"
                    :cy="point.y"
                    r="0.5"
                    class="drawing-point-outer"
                  />
                </g>
              </g>
            </svg>
            <!-- 自定义Tooltip -->
            <Tooltip
              v-if="tooltipContent"
              :content="tooltipContent"
              :position="tooltipPosition"
              :positionType="tooltipPositionType"
            />
          </div>
        </div>
        
        <!-- 热点列表 -->
        <div class="hotspot-list">
          <h5>热点列表 ({{ sceneHotspots.length }})</h5>
          <div 
            v-for="(hotspot, index) in sceneHotspots" 
            :key="hotspot.id"
            class="hotspot-item"
            :class="{ active: editingHotspotIndex === index }"
            @click="editHotspot(hotspot, index)"
          >
            <div class="hotspot-info">
              <div class="hotspot-type">{{ getHotspotTypeLabel(hotspot.type) }}</div>
              <div class="hotspot-desc">{{ hotspot.description || '无描述' }}</div>
            </div>
            <button @click.stop="deleteHotspot(index)" class="btn btn-danger btn-sm">删除</button>
          </div>
          <div v-if="sceneHotspots.length === 0" class="no-hotspots">
            该场景暂无热点
          </div>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="drawing-controls" v-if="selectedSceneId">
        <button 
          @click="startDrawing" 
          :disabled="isDrawing"
          class="btn btn-primary"
          :class="{ active: isDrawing }"
        >
          {{ isDrawing ? '绘制中...' : '开始绘制' }}
        </button>
        <button 
          @click="finishDrawing" 
          :disabled="!isDrawing || currentPoints.length < 3"
          class="btn btn-success"
        >
          完成绘制
        </button>
        <button 
          @click="cancelDrawing" 
          :disabled="!isDrawing"
          class="btn btn-secondary"
        >
          取消绘制
        </button>
      </div>
      
      <!-- 热点创建/编辑表单模态框 -->
      <div v-if="showHotspotForm" class="modal-overlay" @click="cancelForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h4>{{ editingHotspot ? '编辑热点' : '创建热点' }}</h4>
            <button class="close-button" @click="cancelForm">&times;</button>
          </div>
          
          <div class="form-group">
            <label class="form-label">热点类型:</label>
            <select class="form-control" v-model="hotspotForm.type">
              <option value="navigation">导航</option>
              <option value="info">信息</option>
              <option value="action">动作</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">描述:</label>
            <textarea 
              class="form-control" 
              v-model="hotspotForm.description" 
              rows="3"
              placeholder="热点描述"
            ></textarea>
          </div>
          
          <div v-if="hotspotForm.type === 'navigation'" class="form-group">
            <label class="form-label">目标场景:</label>
            <select class="form-control" v-model="hotspotForm.targetScene">
              <option value="">选择目标场景</option>
              <option 
                v-for="scene in allScenesArray" 
                :key="scene.id" 
                :value="scene.id"
              >
                {{ scene.id }} - {{ scene.description || '无描述' }}
              </option>
            </select>
          </div>
          
          <div v-if="hotspotForm.type === 'info'" class="form-group">
            <label class="form-label">信息内容:</label>
            <textarea 
              class="form-control" 
              v-model="hotspotForm.infoContent" 
              rows="3"
              placeholder="信息内容"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" @click="saveHotspot">保存</button>
            <button class="btn btn-secondary" @click="cancelForm">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useHotspot } from '../../composables/useHotspot';
import Tooltip from '@/components/ui/Tooltip.vue';

export default {
  name: 'AdminHotspotEditor',
  components: {
    Tooltip
  },
  setup() {
    const store = useStore();
    const { addHotspot, updateHotspot, removeHotspot } = useHotspot();
    
    const selectedSceneId = ref('');
    const showHotspotForm = ref(false);
    const editingHotspot = ref(null);
    const editingHotspotIndex = ref(null);
    const previewImage = ref(null);
    const imageWrapper = ref(null);
    
    // Tooltip相关
    const tooltipContent = ref('');
    const tooltipPosition = ref({ x: 0, y: 0 });
    const tooltipPositionType = ref('top');
    const tooltipTimeout = ref(null);
    
    // 绘制相关状态
    const isDrawing = ref(false);
    const currentPoints = ref([]);
    
    // 表单数据
    const hotspotForm = reactive({
      id: '',
      type: 'navigation',
      description: '',
      targetScene: '',
      infoContent: ''
    });
    
    // 获取所有场景
    const allScenesArray = computed(() => {
      const scenes = store.getters['scene/allScenes'];
      return Object.keys(scenes).map(id => ({
        id,
        ...scenes[id]
      }));
    });
    
    // 获取选中的场景
    const selectedScene = computed(() => {
      if (!selectedSceneId.value) return null;
      return store.getters['scene/getSceneById'](selectedSceneId.value);
    });
    
    // 获取选中场景的图片路径
    const selectedSceneImage = computed(() => {
      if (!selectedScene.value || !selectedScene.value.image) return '';
      return getImagePath(selectedScene.value.image);
    });
    
    // 获取选中场景的描述
    const selectedSceneDescription = computed(() => {
      if (!selectedScene.value) return '';
      return selectedScene.value.description || selectedScene.value.id;
    });
    
    // 获取当前场景的热点
    const sceneHotspots = computed(() => {
      if (!selectedSceneId.value) return [];
      const hotspots = store.getters['hotspot/getHotspotsByScene'](selectedSceneId.value);
      // 过滤掉可能的null或undefined热点
      return Array.isArray(hotspots) ? hotspots.filter(hotspot => hotspot && hotspot.id) : [];
    });
    
    // 获取图片路径
    const getImagePath = (imagePath) => {
      // 如果是完整URL，直接返回
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      
      // 处理相对路径，与SceneManager.vue中的处理方式保持一致
      let processedPath = imagePath;
      if (imagePath.startsWith('images/')) {
        // 将images/路径替换为/src/assets/images/
        processedPath = imagePath.replace('images/', '/src/assets/images/');
      } else if (!imagePath.startsWith('/')) {
        // 如果不是绝对路径，添加前缀
        processedPath = '/' + imagePath;
      }
      
      return processedPath;
    };
    
    // 选择场景
    const selectScene = (sceneId) => {
      selectedSceneId.value = sceneId;
    };
    
    // 返回场景选择
    const backToSceneSelection = () => {
      selectedSceneId.value = '';
      editingHotspot.value = null;
      showHotspotForm.value = false;
    };
    
    // 处理图片点击事件
    const handleImageClick = (event) => {
      // 防止触摸事件的默认行为和冒泡
      // event.preventDefault(); // 不阻止默认行为，以免影响其他交互
      event.stopPropagation();
      
      if (!previewImage.value || !isDrawing.value) return;
      
      // 确保事件目标是SVG或其子元素
      const svg = event.currentTarget.querySelector('svg');
      if (!svg) return;
      
      // 获取触摸坐标或鼠标坐标
      let clientX, clientY;
      if (event.touches && event.touches.length > 0) {
        // 触摸事件
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        // 触摸结束事件
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        // 鼠标事件
        clientX = event.clientX;
        clientY = event.clientY;
      }
      
      // 获取SVG点坐标
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      
      // 转换为客户坐标到SVG坐标
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      // 确保坐标在0-100范围内
      const x = Math.max(0, Math.min(100, svgP.x));
      const y = Math.max(0, Math.min(100, svgP.y));
      
      console.log('Click coordinates:', { clientX, clientY, svgX: svgP.x, svgY: svgP.y, x, y });
      console.log('Current points before adding:', currentPoints.value);
      
      // 添加点到当前绘制
      currentPoints.value.push({ x, y });
      
      // 验证点是否添加成功
      console.log('Points after adding:', currentPoints.value);
      console.log('SVG element:', svg);
    };
    
    // 开始绘制
    const startDrawing = () => {
      isDrawing.value = true;
      currentPoints.value = [];
    };
    
    // 完成绘制
    const finishDrawing = () => {
      if (currentPoints.value.length < 3) {
        alert('多边形至少需要3个点');
        return;
      }
      
      // 初始化表单
      hotspotForm.id = '';
      hotspotForm.type = 'navigation';
      hotspotForm.description = '';
      hotspotForm.targetScene = '';
      hotspotForm.infoContent = '';
      
      // 设置为新热点模式
      editingHotspot.value = null;
      editingHotspotIndex.value = null;
      showHotspotForm.value = true;
      
      // 结束绘制状态
      isDrawing.value = false;
    };
    
    // 取消绘制
    const cancelDrawing = () => {
      isDrawing.value = false;
      currentPoints.value = [];
    };
    
    // 获取绘制中的点（用于SVG）
    const getDrawingPointsForSVG = () => {
      if (currentPoints.value.length === 0) return '';
      return currentPoints.value.map(point => `${point.x},${point.y}`).join(' ');
    };
    
    // 获取多边形点字符串（用于SVG）
    const getPolygonPointsForSVG = (points) => {
      if (!points || points.length === 0) return '';
      return points.map(point => `${point.x},${point.y}`).join(' ');
    };
    
    // 获取点位置
    const getPointPosition = (point) => {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        return { x: 0, y: 0 };
      }
      return {
        x: point.x,
        y: point.y
      };
    };

    // 获取标签位置
    const getLabelPosition = (points) => {
      if (!points || points.length === 0) return { x: 0, y: 0 };
      
      // 计算所有点的中心位置
      let minX = Math.min(...points.map(p => p.x));
      let maxX = Math.max(...points.map(p => p.x));
      let minY = Math.min(...points.map(p => p.y));
      let maxY = Math.max(...points.map(p => p.y));
      
      return {
        x: (minX + maxX) / 2,
        y: minY - 5
      };
    };
    
    // 编辑热点
    const editHotspot = (hotspot, index) => {
      if (isDrawing.value) return;
      
      editingHotspot.value = hotspot;
      editingHotspotIndex.value = index;
      
      // 填充表单数据
      hotspotForm.id = hotspot.id;
      hotspotForm.type = hotspot.type;
      hotspotForm.description = hotspot.description || '';
      hotspotForm.targetScene = hotspot.targetScene || '';
      hotspotForm.infoContent = hotspot.infoContent || '';
      
      showHotspotForm.value = true;
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
    
    // 处理热点区域点击
    const handleHotspotClick = (event) => {
      //  prevents touch事件默认行为和冒泡
      event.preventDefault();
      event.stopPropagation();
      
      if (isDrawing.value) return;
      
      const svg = event.target.closest('svg');
      if (!svg) return;
      
      // 获取触摸坐标或鼠标坐标
      let clientX, clientY;
      if (event.touches && event.touches.length > 0) {
        // 触摸事件
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        // 触摸结束事件
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        // 鼠标事件
        clientX = event.clientX;
        clientY = event.clientY;
      }
      
      // 获取SVG点坐标
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      
      // 转换为客户坐标到SVG坐标
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      // 确保坐标在0-100范围内
      const x = Math.max(0, Math.min(100, svgP.x));
      const y = Math.max(0, Math.min(100, svgP.y));
      
      const clickPoint = { x, y };
      
      // 检查点击是否在任何热点区域内
      for (let i = 0; i < sceneHotspots.value.length; i++) {
        const hotspot = sceneHotspots.value[i];
        if (hotspot.points && isPointInPolygon(clickPoint, hotspot.points)) {
          editHotspot(hotspot, i);
          return;
        }
      }
    };
    
    // 保存热点
    const saveHotspot = () => {
      // 验证必填字段
      if (!hotspotForm.type) {
        alert('请选择热点类型');
        return;
      }
      
      if (editingHotspot.value) {
        // 更新现有热点
        const updatedHotspot = {
          ...editingHotspot.value,
          type: hotspotForm.type,
          description: hotspotForm.description,
          targetScene: hotspotForm.targetScene,
          infoContent: hotspotForm.infoContent
        };
        
        console.log('Updating hotspot:', {
          sceneId: selectedSceneId.value,
          hotspotIndex: editingHotspotIndex.value,
          hotspot: updatedHotspot
        });
        
        // 修复参数传递格式，确保符合store中mutation的期望格式
        updateHotspot({
          sceneId: selectedSceneId.value,
          hotspotIndex: editingHotspotIndex.value,
          hotspot: updatedHotspot
        });
      } else {
        // 创建新热点
        if (currentPoints.value.length < 3) {
          alert('请至少绘制一个包含3个点的多边形');
          return;
        }
        
        const newHotspot = {
          id: Date.now().toString(),
          sceneId: selectedSceneId.value,
          points: [...currentPoints.value],
          type: hotspotForm.type,
          description: hotspotForm.description,
          targetScene: hotspotForm.targetScene,
          infoContent: hotspotForm.infoContent
        };
        
        console.log('Creating new hotspot:', {
          sceneId: selectedSceneId.value,
          hotspot: newHotspot
        });
        
        // 修复参数传递格式，确保符合store中mutation的期望格式
        addHotspot({
          sceneId: selectedSceneId.value,
          hotspot: newHotspot
        });
      }
      
      // 重置状态
      cancelForm();
    };
    
    // 删除热点
    const deleteHotspot = (hotspotIndex) => {
      console.log('Attempting to delete hotspot at index:', hotspotIndex);
      console.log('Current scene ID:', selectedSceneId.value);
      console.log('Scene hotspots:', sceneHotspots.value);
      
      if (confirm('确定要删除这个热点吗？')) {
        console.log('Removing hotspot with sceneId:', selectedSceneId.value, 'and index:', hotspotIndex);
        removeHotspot({
          sceneId: selectedSceneId.value,
          hotspotIndex: hotspotIndex
        });
      }
    };
    
    // 取消表单
    const cancelForm = () => {
      showHotspotForm.value = false;
      editingHotspot.value = null;
      editingHotspotIndex.value = null;
      currentPoints.value = [];
      isDrawing.value = false;
    };
    
    // 获取热点类型标签
    const getHotspotTypeLabel = (type) => {
      switch (type) {
        case 'navigation': return '导航';
        case 'info': return '信息';
        case 'action': return '动作';
        default: return type;
      }
    };
    
    // 获取表单显示位置
    const formPosition = computed(() => {
      if (!showHotspotForm.value || !imageWrapper.value) {
        return { x: 0, y: 0 };
      }

      // 获取图片容器的位置
      const wrapperRect = imageWrapper.value.getBoundingClientRect();
      
      // 如果是新热点，显示在图片右上角
      if (!editingHotspot.value) {
        return {
          x: wrapperRect.width + 20,
          y: 0
        };
      }

      // 如果是编辑热点，显示在热点区域附近
      const labelPos = getLabelPosition(editingHotspot.value.points);
      const formWidth = 300; // 表单宽度
      const formHeight = 300; // 表单高度

      // 计算实际显示位置
      const x = labelPos.x * wrapperRect.width / 100;
      const y = labelPos.y * wrapperRect.height / 100;

      // 确保表单不超出容器
      const finalX = Math.max(0, Math.min(wrapperRect.width - formWidth, x));
      const finalY = Math.max(0, Math.min(wrapperRect.height - formHeight, y));

      return { x: finalX, y: finalY };
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
    
    // 添加调试信息
    console.log('AdminHotspotEditor initialized');
    
    return {
      selectedSceneId,
      showHotspotForm,
      editingHotspot,
      editingHotspotIndex,
      previewImage,
      imageWrapper,
      hotspotForm,
      allScenesArray,
      selectedScene,
      selectedSceneImage,
      selectedSceneDescription,
      sceneHotspots,
      getImagePath,
      selectScene,
      backToSceneSelection,
      handleImageClick,
      editHotspot,
      saveHotspot,
      deleteHotspot,
      cancelForm,
      getHotspotTypeLabel,
      // 绘制相关
      isDrawing,
      currentPoints,
      startDrawing,
      finishDrawing,
      cancelDrawing,
      getDrawingPointsForSVG,
      getPolygonPointsForSVG,
      getLabelPosition,
      getPointPosition,
      // 热点定位相关
      handleHotspotClick,
      isPointInPolygon,
      // Tooltip相关
      tooltipContent,
      tooltipPosition,
      tooltipPositionType,
      showTooltip,
      hideTooltip,
      // 表单位置
      formPosition
    };
  }
};
</script>

<style scoped>
.admin-hotspot-editor {
  padding: 20px 0;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scene-image-preview {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.scene-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f5f5;
  color: #999;
}

.scene-info {
  padding: 10px;
}

.scene-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.scene-description {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.editor-header h4 {
  margin: 0;
}

.hotspot-editor-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.image-preview-container {
  flex: 3;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
  /* 确保容器有明确的尺寸 */
  display: block;
  /* 使用padding-bottom技术保持宽高比 */
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  height: 0;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.hotspot-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto; /* 允许SVG接收事件 */
  transform: translate(0, 0);
  z-index: 10; /* 确保SVG在图片上方 */
  display: block;
}

.hotspot-polygon {
  fill: rgba(25, 118, 210, 0.2);
  stroke: #1976d2;
  stroke-width: 0.15;
  cursor: pointer;
  pointer-events: auto;
  /* 添加变换以补偿拉伸 */
  transform: scale(1, 1);
  transform-origin: center;
}

.hotspot-polygon:hover {
  fill: rgba(25, 118, 210, 0.3);
}

.hotspot-label-text {
  fill: #1976d2;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
  text-anchor: middle;
  dominant-baseline: middle;
  /* 添加变换以补偿拉伸 */
  transform: scale(1, 1);
  transform-origin: center;
}

.drawing-line {
  stroke: #f57c00;
  stroke-width: 0.7;
  stroke-dasharray: 2,2;
  pointer-events: none;
  /* 添加变换以补偿拉伸 */
  vector-effect: non-scaling-stroke;
}

.drawing-polygon {
  fill: rgba(245, 124, 0, 0.2);
  stroke: #f57c00;
  stroke-width: 0.7;
  pointer-events: auto; /* 允许绘制的多边形接收事件 */
  /* 添加变换以补偿拉伸 */
  vector-effect: non-scaling-stroke;
}

.drawing-point-outer {
  fill: #f57c00;
  stroke: white;
  stroke-width: 0.8;
  pointer-events: none;
  /* 确保点可见并补偿拉伸 */
  vector-effect: non-scaling-stroke;
  /* 调整点的大小，使其更合适 */
  r: 0.5;
}

.drawing-controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.drawing-controls .btn {
  min-width: 80px;
}

.drawing-controls .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drawing-controls .btn.active {
  background-color: #f57c00;
  box-shadow: 0 0 0 2px rgba(245, 124, 0, 0.3);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #333;
}

.form-actions {
  display: flex;
  gap:10px;
}

.hotspot-list {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.hotspot-list h5 {
  margin-top: 0;
  margin-bottom: 15px;
}

.hotspot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
}

.hotspot-item:hover {
  background-color: #f5f5f5;
}

.hotspot-item.active {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.hotspot-info {
  flex: 1;
}

.hotspot-type {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 3px;
}

.hotspot-desc {
  font-size: 12px;
  color: #666;
}

.no-hotspots {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 0;
}
</style>
