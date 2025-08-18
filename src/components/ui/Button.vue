<template>
  <button 
    class="btn" 
    :class="buttonClass" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'primary' // primary, secondary, success, danger, warning, outline
    },
    size: {
      type: String,
      default: 'md' // sm, md, lg
    },
    disabled: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    // 计算按钮类名
    const buttonClass = computed(() => {
      return [
        `btn-${props.type}`,
        `btn-${props.size}`,
        {
          'btn-block': props.block,
          'btn-disabled': props.disabled
        }
      ];
    });
    
    // 处理点击事件
    const handleClick = (event) => {
      if (!props.disabled) {
        emit('click', event);
      }
    };
    
    return {
      buttonClass,
      handleClick
    };
  }
};
</script>

<style scoped>
.btn {
  display: inline-block;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

.btn-block {
  display: block;
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #bd2130;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}
</style>