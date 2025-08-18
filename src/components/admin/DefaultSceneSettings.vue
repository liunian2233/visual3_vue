<template>
  <div></div>
</template>

<script>
export default {
  name: 'DefaultSceneSettings'
};
</script>

<style scoped>
.default-scene-settings {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.current-default, .no-default {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.current-default {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.no-default {
  background-color: #fff3e0;
  color: #ef6c00;
}
</style>