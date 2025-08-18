<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      class="input"
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    >
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md' // sm, md, lg
    }
  },
  emits: ['update:modelValue', 'blur', 'focus'],
  setup(props, { emit }) {
    // 计算输入框类名
    const inputClass = computed(() => {
      return [
        `input-${props.size}`,
        {
          'input-disabled': props.disabled,
          'input-readonly': props.readonly
        }
      ];
    });
    
    // 处理输入事件
    const handleInput = (event) => {
      emit('update:modelValue', event.target.value);
    };
    
    // 处理失焦事件
    const handleBlur = (event) => {
      emit('blur', event);
    };
    
    // 处理聚焦事件
    const handleFocus = (event) => {
      emit('focus', event);
    };
    
    return {
      inputClass,
      handleInput,
      handleBlur,
      handleFocus
    };
  }
};
</script>

<style scoped>
.input-wrapper {
  display: block;
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.input-lg {
  padding: 12px 16px;
  font-size: 16px;
}

.input-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-readonly {
  background-color: #f9f9f9;
}

.input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>