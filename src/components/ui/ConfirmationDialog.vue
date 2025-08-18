<template>
  <Modal
    :visible="visible"
    :title="title"
    :closable="closable"
    :show-footer="showFooter"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    @update:visible="handleVisibilityChange"
    @close="handleClose"
    @confirm="handleConfirm"
  >
    <p>{{ message }}</p>
    <slot></slot>
  </Modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
  name: 'ConfirmationDialog',
  components: {
    Modal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '确认'
    },
    message: {
      type: String,
      default: '您确定要执行此操作吗？'
    },
    closable: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  emits: ['update:visible', 'confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    // 处理可见性变化
    const handleVisibilityChange = (visible) => {
      emit('update:visible', visible);
    };
    
    // 处理关闭事件
    const handleClose = () => {
      emit('close');
      emit('cancel');
    };
    
    // 处理确认事件
    const handleConfirm = () => {
      emit('confirm');
    };
    
    return {
      handleVisibilityChange,
      handleClose,
      handleConfirm
    };
  }
};
</script>