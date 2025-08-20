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
            ref="imageWrapper"
          >
            <img 
              :src="selectedSceneImage" 
              :alt="selectedSceneDescription"
              class="preview-image"
              ref="previewImage"
              @load="onImageLoad"
            >
            
            <!-- Konva舞台 -->
            <v-stage 
              v-if="stageConfig.width && stageConfig.height"
              ref="stage"
              :config="stageConfig"
              class="hotspot-stage"
              @click="handleStageClick"
              @touchstart="handleStageClick"
            >
              <v-layer ref="layer">
                <!-- 显示现有热点 -->
                <v-group 
                  v-for="(hotspot, index) in sceneHotspots" 
                  :key="hotspot.id"
                  @mouseenter="showTooltip(hotspot, $event)"
                  @mouseleave="hideTooltip"
                >
                  <v-line 
                    :config="{
                      points: getPointsForKonva(hotspot.points),
                      fill: 'rgba(25, 118, 210, 0.2)',
                      stroke: '#1976d2',
                      strokeWidth: 2,
                      closed: true,
                      listening: true
                    }"
                    @click="handleHotspotClick"
                    @touchstart="handleHotspotClick"
                  />
                </v-group>
                
                <!-- 显示正在绘制的热点 -->
                <v-group v-if="isDrawing">
                  <v-line 
                    v-if="currentPoints.length > 0"
                    :config="{
                      points: getDrawingPointsForKonva(),
                      stroke: '#f57c00',
                      strokeWidth: 2,
                      dash: [10, 5],
                      closed: false
                    }"
                  />
                  <v-line 
                    v-if="currentPoints.length > 2"
                    :config="{
                      points: getPointsForKonva(currentPoints),
                      fill: 'rgba(245, 124, 0, 0.2)',
                      stroke: '#f57c00',
                      strokeWidth: 2,
                      closed: true
                    }"
                  />
                  <!-- 显示绘制点 -->
                  <v-circle
                    v-for="(point, index) in currentPoints"
                    :key="index"
                    :config="{
                      x: point.x,
                      y: point.y,
                      radius: 6,
                      fill: '#f57c00',
                      stroke: 'white',
                      strokeWidth: 1
                    }"
                  />
                </v-group>
              </v-layer>
            </v-stage>
            
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
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useHotspot } from '../../composables/useHotspot';
import Tooltip from '@/components/ui/Tooltip.vue';
import VueKonva from 'vue-konva';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'KonvaHotspotEditor',
  components: {
    Tooltip,
    'v-stage': VueKonva.Stage,
    'v-layer': VueKonva.Layer,
    'v-line': VueKonva.Line,
    'v-circle': VueKonva.Circle,
    'v-group': VueKonva.Group
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
    const stage = ref(null);
    const layer = ref(null);
    
    // Tooltip相关
    const tooltipContent = ref('');
    const tooltipPosition = ref({ x: 0, y: 0 });
    const tooltipPositionType = ref('top');
    const tooltipTimeout = ref(null);
    
    // 绘制相关状态
    const isDrawing = ref(false);
    const currentPoints = ref([]);
    
    // Konva舞台配置
    const stageConfig = reactive({
      width: 0,
      height: 0
    });
    
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
      return store.getters['scene/allScenes'][selectedSceneId.value];
    });
    
    // 获取选中场景的图片路径
    const selectedSceneImage = computed(() => {
      if (!selectedScene.value || !selectedScene.value.image) return '';
      // 正确处理图片路径，指向src/assets/images目录
      return `/src/assets/images/${selectedScene.value.image.split('/').pop()}`;
    });

    // 获取选中场景的描述
    const selectedSceneDescription = computed(() => {
      if (!selectedScene.value) return '';
      return selectedScene.value.description || selectedScene.value.id;
    });
    
    // 获取选中场景的热点
    const sceneHotspots = computed(() => {
      if (!selectedSceneId.value) return [];
      return store.getters['hotspot/getHotspotsByScene'](selectedSceneId.value);
    });
    
    // 获取图片路径
    const getImagePath = (imageName) => {
      // 确保图片路径正确指向src/assets/images目录
      if (imageName.startsWith('images/')) {
        return `/src/assets/images/${imageName.substring(7)}`;
      }
      return `/src/assets/images/${imageName}`;
    };
    
    // 选择场景
    const selectScene = (sceneId) => {
      selectedSceneId.value = sceneId;
    };
    
    // 返回场景选择
    const backToSceneSelection = () => {
      selectedSceneId.value = '';
      cancelForm();
    };
    
    // 图片加载完成事件
    const onImageLoad = (event) => {
      const img = event.target;
      stageConfig.width = img.naturalWidth;
      stageConfig.height = img.naturalHeight;
    };
    
    // 获取Konva点坐标
    const getPointsForKonva = (points) => {
      if (!points || points.length === 0) return [];
      return points.flatMap(point => [point.x, point.y]);
    };
    
    // 获取绘制中的点（用于Konva）
    const getDrawingPointsForKonva = () => {
      if (currentPoints.value.length === 0) return [];
      return currentPoints.value.flatMap(point => [point.x, point.y]);
    };
    
    // 处理舞台点击事件
    const handleStageClick = (event) => {
      if (!isDrawing.value) return;
      
      // 阻止事件冒泡
      event.evt.preventDefault();
      event.evt.stopPropagation();
      
      // 获取点击坐标
      const pos = event.target.getStage().getPointerPosition();
      
      // 添加点到当前绘制
      currentPoints.value.push({
        x: pos.x,
        y: pos.y
      });
    };
    
    // 处理热点区域点击
    const handleHotspotClick = (event) => {
      event.evt.preventDefault();
      event.evt.stopPropagation();
      
      if (isDrawing.value) return;
      
      // 获取点击坐标
      const pos = event.target.getStage().getPointerPosition();
      
      // 检查点击是否在任何热点区域内
      for (let i = 0; i < sceneHotspots.value.length; i++) {
        const hotspot = sceneHotspots.value[i];
        if (hotspot.points && isPointInPolygon(pos, hotspot.points)) {
          editHotspot(hotspot, i);
          return;
        }
      }
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
          id: uuidv4(),
          sceneId: selectedSceneId.value,
          points: [...currentPoints.value],
          type: hotspotForm.type,
          description: hotspotForm.description,
          targetScene: hotspotForm.targetScene,
          infoContent: hotspotForm.infoContent
        };
        
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
      if (confirm('确定要删除这个热点吗？')) {
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
    
    // 显示Tooltip
    const showTooltip = (hotspot, event) => {
      if (!hotspot.description) {
        return;
      }
      
      // 计算多边形的边界框
      if (!hotspot.points || hotspot.points.length === 0) {
        return;
      }
      
      // 获取所有点的最小和最大坐标
      let minX = Math.min(...hotspot.points.map(p => p.x));
      let maxX = Math.max(...hotspot.points.map(p => p.x));
      let minY = Math.min(...hotspot.points.map(p => p.y));
      
      // 计算多边形中心点
      const centerX = (minX + maxX) / 2;
      const centerY = minY - 20; // 在多边形顶部上方20像素
      
      // 获取舞台元素和缩放信息
      const stage = event.target.getStage();
      const scale = stage.scale();
      const container = stage.container();
      const containerRect = container.getBoundingClientRect();
      
      // 计算相对于页面的位置
      tooltipPosition.value = {
        x: containerRect.left + (centerX * scale.x),
        y: containerRect.top + (centerY * scale.y)
      };
      
      tooltipContent.value = hotspot.description;
      tooltipPositionType.value = 'top';
      
      // 设置延迟显示
      if (tooltipTimeout.value) {
        clearTimeout(tooltipTimeout.value);
      }
      tooltipTimeout.value = setTimeout(() => {
        tooltipContent.value = hotspot.description;
      }, 300);
    };
    
    // 隐藏Tooltip
    const hideTooltip = () => {
      if (tooltipTimeout.value) {
        clearTimeout(tooltipTimeout.value);
        tooltipTimeout.value = null;
      }
      tooltipContent.value = '';
    };
    
    // 组件卸载前清理
    onBeforeUnmount(() => {
      hideTooltip();
    });
    
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
      onImageLoad,
      // Konva相关
      stage,
      layer,
      stageConfig,
      getPointsForKonva,
      getDrawingPointsForKonva,
      handleStageClick,
      handleHotspotClick,
      isPointInPolygon,
      // 绘制相关
      isDrawing,
      currentPoints,
      startDrawing,
      finishDrawing,
      cancelDrawing,
      editHotspot,
      saveHotspot,
      deleteHotspot,
      cancelForm,
      getHotspotTypeLabel,
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
  display: block;
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

.hotspot-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
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