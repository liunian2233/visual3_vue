import { computed } from 'vue';
import { useStore } from 'vuex';

// 热点相关组合函数
export function useHotspot() {
  const store = useStore();

  // 获取热点状态
  const allHotspots = computed(() => store.getters['hotspot/allHotspots']);
  const selectedHotspot = computed(() => store.getters['hotspot/selectedHotspot']);
  const isEditing = computed(() => store.getters['hotspot/isEditing']);
  const getHotspotsByScene = (sceneId) => store.getters['hotspot/getHotspotsByScene'](sceneId);
  const getHotspotById = (hotspotId) => store.getters['hotspot/getHotspotById'](hotspotId);

  // 热点操作函数
  const loadHotspots = (hotspots) => {
    store.dispatch('hotspot/loadHotspots', hotspots);
  };

  const addHotspot = (hotspot) => {
    store.dispatch('hotspot/addHotspot', hotspot);
  };

  const updateHotspot = (hotspot) => {
    store.dispatch('hotspot/updateHotspot', hotspot);
  };

  // 修复删除热点函数，确保正确传递参数
  const removeHotspot = (payload) => {
    store.dispatch('hotspot/removeHotspot', payload);
  };

  const selectHotspot = (hotspotId) => {
    store.dispatch('hotspot/selectHotspot', hotspotId);
  };

  const setEditingMode = (isEditing) => {
    store.dispatch('hotspot/setEditingMode', isEditing);
  };

  return {
    // 状态
    allHotspots,
    selectedHotspot,
    isEditing,
    getHotspotsByScene,
    getHotspotById,

    // 方法
    loadHotspots,
    addHotspot,
    updateHotspot,
    removeHotspot,
    selectHotspot,
    setEditingMode
  };
}