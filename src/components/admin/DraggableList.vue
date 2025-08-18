<template>
  <div class="draggable-list">
    <div 
      v-for="(item, index) in items" 
      :key="item.id" 
      class="draggable-item"
      :class="{ 'dragging': draggingIndex === index }"
      draggable="true"
      @dragstart="handleDragStart(index, $event)"
      @dragover.prevent="handleDragOver(index, $event)"
      @dragenter.prevent
      @dragend="handleDragEnd"
    >
      <div class="drag-handle">⋮⋮</div>
      <div class="item-content">
        <slot :item="item" :index="index"></slot>
      </div>
      <div class="item-actions">
        <button 
          class="btn btn-sm btn-outline" 
          @click="$emit('move-up', index)"
          :disabled="index === 0"
        >
          ↑
        </button>
        <button 
          class="btn btn-sm btn-outline" 
          @click="$emit('move-down', index)"
          :disabled="index === items.length - 1"
        >
          ↓
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'DraggableList',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  emits: ['move-up', 'move-down', 'reorder'],
  setup(props, { emit }) {
    const draggingIndex = ref(null);
    const dragOverIndex = ref(null);
    
    const handleDragStart = (index, event) => {
      draggingIndex.value = index;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index);
    };
    
    const handleDragOver = (index, event) => {
      if (draggingIndex.value === null) return;
      
      dragOverIndex.value = index;
      event.preventDefault();
    };
    
    const handleDragEnd = () => {
      if (draggingIndex.value !== null && dragOverIndex.value !== null) {
        // 发送重新排序事件
        emit('reorder', draggingIndex.value, dragOverIndex.value);
      }
      
      draggingIndex.value = null;
      dragOverIndex.value = null;
    };
    
    return {
      draggingIndex,
      handleDragStart,
      handleDragOver,
      handleDragEnd
    };
  }
};
</script>

<style scoped>
.draggable-list {
  min-height: 50px;
}

.draggable-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.draggable-item.dragging {
  opacity: 0.5;
  background-color: #e9ecef;
}

.drag-handle {
  cursor: move;
  padding: 0 10px;
  color: #999;
  font-size: 18px;
  user-select: none;
}

.item-content {
  flex: 1;
}

.item-actions {
  display: flex;
  gap: 5px;
}
</style>