// 数据库工具函数
class Database {
  // 保存数据到localStorage
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  // 从localStorage获取数据
  static load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue;
    }
  }

  // 从localStorage删除数据
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }

  // 清空所有localStorage数据
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
}

export default Database;