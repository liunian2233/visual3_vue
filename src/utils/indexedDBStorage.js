// IndexedDB存储工具类
class IndexedDBStorage {
  constructor(dbName = 'VuexStore', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.initPromise = null; // 用于确保只初始化一次
  }

  // 初始化数据库
  async init() {
    console.log('IndexedDBStorage: 开始初始化');
    // 如果已经在初始化中，返回该Promise
    if (this.initPromise) {
      console.log('IndexedDBStorage: 使用现有的初始化Promise');
      return this.initPromise;
    }

    // 如果已经初始化完成，直接返回
    if (this.db) {
      console.log('IndexedDBStorage: 数据库已初始化，直接返回');
      return this.db;
    }

    console.log('IndexedDBStorage: 创建新的初始化Promise');
    // 开始初始化
    this.initPromise = new Promise((resolve, reject) => {
      console.log(`IndexedDBStorage: 尝试打开数据库 ${this.dbName} 版本 ${this.version}`);
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = (event) => {
        console.error('数据库打开失败:', event.target.error);
        this.initPromise = null;
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDBStorage: 数据库打开成功');
        resolve(this.db);
      };
      
      // 创建对象存储空间
      request.onupgradeneeded = (event) => {
        console.log('IndexedDBStorage: 数据库升级 needed');
        this.db = event.target.result;
        
        // 创建存储状态数据的对象存储空间
        if (!this.db.objectStoreNames.contains('state')) {
          console.log('IndexedDBStorage: 创建state对象存储空间');
          const objectStore = this.db.createObjectStore('state', { keyPath: 'module' });
          objectStore.createIndex('module', 'module', { unique: true });
        }
      };
    });

    try {
      const result = await this.initPromise;
      console.log('IndexedDBStorage: 初始化完成');
      return result;
    } catch (error) {
      this.initPromise = null;
      console.error('IndexedDBStorage: 初始化失败', error);
      throw error;
    }
  }

  // 确保数据库已初始化
  async ensureInitialized() {
    console.log('IndexedDBStorage: 确保初始化');
    if (!this.db) {
      console.log('IndexedDBStorage: 数据库未初始化，开始初始化');
      await this.init();
    } else {
      console.log('IndexedDBStorage: 数据库已初始化');
    }
  }

  // 保存状态数据
  async setItem(key, value) {
    console.log('IndexedDBStorage: setItem', key, value);
    try {
      await this.ensureInitialized();
      
      // 序列化值以避免DataCloneError
      const serializedValue = JSON.stringify(value);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['state'], 'readwrite');
        const objectStore = transaction.objectStore('state');
        
        const request = objectStore.put({
          module: key,
          data: serializedValue
        });
        
        request.onsuccess = () => {
          console.log('IndexedDBStorage: setItem 成功', key);
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('setItem error:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('setItem failed:', error);
      // 出错时不阻塞应用运行
    }
  }

  // 获取状态数据
  async getItem(key) {
    console.log('IndexedDBStorage: getItem', key);
    try {
      await this.ensureInitialized();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['state'], 'readonly');
        const objectStore = transaction.objectStore('state');
        
        const request = objectStore.get(key);
        
        request.onsuccess = (event) => {
          const result = event.target.result;
          console.log('IndexedDBStorage: getItem 结果', key, result);
          // 反序列化值
          try {
            const deserializedResult = result ? JSON.parse(result.data) : null;
            resolve(deserializedResult);
          } catch (parseError) {
            console.error('getItem parse error:', parseError);
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          console.error('getItem error:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('getItem failed:', error);
      return null;
    }
  }

  // 删除状态数据
  async removeItem(key) {
    try {
      await this.ensureInitialized();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['state'], 'readwrite');
        const objectStore = transaction.objectStore('state');
        
        const request = objectStore.delete(key);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('removeItem error:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('removeItem failed:', error);
    }
  }

  // 清空所有状态数据
  async clear() {
    try {
      await this.ensureInitialized();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['state'], 'readwrite');
        const objectStore = transaction.objectStore('state');
        
        const request = objectStore.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('clear error:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('clear failed:', error);
    }
  }
}

// 创建IndexedDB存储实例
const indexedDBStorage = new IndexedDBStorage('Visual3VueStore', 1);

// 导出符合Storage接口的对象
export { indexedDBStorage };

// 默认导出仍然保留，以保持向后兼容性
export default indexedDBStorage;