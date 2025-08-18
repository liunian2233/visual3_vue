<template>
  <div class="navigation">
    <div class="nav-arrow left-arrow" @click="() => onNavigate('left')">←</div>
    <div class="nav-arrow right-arrow" @click="() => onNavigate('right')">→</div>
    <div class="nav-arrow up-arrow" @click="() => onNavigate('up')">↑</div>
    <div class="nav-arrow down-arrow" @click="() => onNavigate('down')">↓</div>
  </div>
</template>

<script>
export default {
  name: 'NavigationArrows',
  emits: ['navigate'],
  setup(props, { emit }) {
    const onNavigate = (direction) => {
      emit('navigate', direction);
    };

    return {
      onNavigate
    };
  }
};
</script>

<style scoped>
/* 导航箭头样式 */
.nav-arrow {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s;
  font-size: 24px;
  border-radius: 50%;
}

.nav-arrow:hover {
  background-color: rgba(50, 50, 50, 0.8);
}

.left-arrow {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.right-arrow {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.up-arrow {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.down-arrow {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}
</style>