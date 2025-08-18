// 常量定义
export const APP_NAME = 'Visual3 Vue';

export const SCENE_DISPLAY_MODES = {
  COVER: 'cover',
  CONTAIN: 'contain',
  FILL: 'fill'
};

export const NAVIGATION_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

export const HOTSPOT_TYPES = {
  NAVIGATION: 'navigation',
  INFO: 'info',
  ACTION: 'action'
};

export const EXAM_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

export const STORAGE_KEYS = {
  SCENES: 'visual3_scenes',
  HOTSPOTS: 'visual3_hotspots',
  EXAM_CONFIG: 'visual3_exam_config',
  SCORE_SETTINGS: 'visual3_score_settings'
};

// 默认场景参考常量（仅作为参考示例，不自动使用）
export const DEFAULT_SCENE_REFERENCE = {
  id: 'ztDoor_duoKai', // 示例场景ID，实际使用时应根据需要设置
  image: 'images/ztDoor_duoKai.jpg',
  imageDisplayMode: SCENE_DISPLAY_MODES.COVER,
  description: '一家神秘的锈湖旅馆矗立在雾中。',
  navigation: {
    right: null,
    left: null,
    up: null,
    down: null
  }
};

export const DEFAULT_EXAM_CONFIG = {
  duration: 60, // 分钟
  sceneTransitionLimit: 10, // 秒
  allowGoBack: true
};

export const DEFAULT_SCORE_SETTINGS = {
  sceneCompletionScore: 10,
  timeBonusMultiplier: 1.5,
  errorPenalty: 5
};

export default {
  APP_NAME,
  SCENE_DISPLAY_MODES,
  NAVIGATION_DIRECTIONS,
  HOTSPOT_TYPES,
  EXAM_STATUS,
  STORAGE_KEYS,
  DEFAULT_SCENE_REFERENCE,
  DEFAULT_EXAM_CONFIG,
  DEFAULT_SCORE_SETTINGS
};