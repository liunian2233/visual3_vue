<template>
  <div class="game-view">
    <GameContainer />
  </div>
</template>

<script>
import GameContainer from '../components/game/GameContainer.vue';

export default {
  name: 'GameView',
  components: {
    GameContainer
  }
};
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100%;
}
</style>