// 哈希缓存类 - 封装请求哈希生成和缓存管理功能
// 使用示例:
// const generator = new RequestHashGenerator()
// const hash = generator.generate({ url: '/api/users', method: 'GET', params: { id: 1 } })
class RequestHashGenerator {
  constructor() {
    this.hashCache = new Map();
    this.CACHE_DURATION = 50; // 50ms缓存时间
  }

  /**
   * 提取核心参数并生成请求哈希值
   * 结合 url、method、data、params 生成唯一哈希值
   * @param {Object} config - 请求配置对象
   * @returns {string} 生成的哈希值
   */
  generate(config = {}) {
    const safeConfig = config && typeof config === 'object' ? config : {};
    const method = (safeConfig.method || 'GET').toUpperCase();
    const url = safeConfig.url || '';
    const baseURL = safeConfig.baseURL || '';
    const fullUrl = baseURL ? baseURL + url : url;

    // 生成请求特征字符串
    const signature = [
      method,
      fullUrl,
      this.serializeValue(safeConfig.params),
      this.serializeValue(safeConfig.data)
    ].filter(part => part !== '').join('|');

    return this.getOrCreateHash(signature);
  }

  /**
   * 深度序列化函数
   * @param {*} value - 需要序列化的值
   * @returns {string} 序列化后的字符串
   */
  serializeValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);

    // 处理FormData
    if (value instanceof FormData) {
      const formDataObj = {};
      for (let [key, val] of value.entries()) {
        formDataObj[key] = val instanceof File ? `[FILE:${val.name}]` : val;
      }
      value = formDataObj;
    }

    // 处理对象和数组
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return '[' + value.map(v => this.serializeValue(v)).join(',') + ']';
      } else {
        // 对象按键名排序
        const sortedKeys = Object.keys(value).sort();
        const pairs = sortedKeys.map(key => {
          const val = value[key];
          if (typeof val === 'function') return '';
          return `"${key}":${this.serializeValue(val)}`;
        }).filter(pair => pair !== '');
        return '{' + pairs.join(',') + '}';
      }
    }

    return String(value);
  }

  /**
   * 获取或创建哈希值
   * @param {string} signature - 请求特征签名
   * @returns {string} 哈希值
   */
  getOrCreateHash(signature) {
    const now = Date.now();

    // 清理过期缓存
    this.cleanupExpiredCache(now);

    // 如果缓存中存在且未过期，返回缓存的哈希值
    if (this.hashCache.has(signature)) {
      const cached = this.hashCache.get(signature);
      if (now - cached.timestamp <= this.CACHE_DURATION) {
        return cached.hash;
      }
    }

    // 生成新的哈希值
    const newHash = this.createHash(signature);

    // 存入缓存
    this.hashCache.set(signature, {
      hash: newHash,
      timestamp: now
    });

    return newHash;
  }

  /**
   * 清理过期缓存
   * @param {number} currentTime - 当前时间戳
   */
  cleanupExpiredCache(currentTime) {
    for (const [key, cached] of this.hashCache.entries()) {
      if (currentTime - cached.timestamp > this.CACHE_DURATION) {
        this.hashCache.delete(key);
      }
    }
  }

  /**
   * 创建哈希值
   * @param {string} str - 输入字符串
   * @returns {string} 生成的哈希值
   */
  createHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 清空所有缓存
   */
  clearCache() {
    this.hashCache.clear();
  }

  /**
   * 获取缓存大小
   * @returns {number} 缓存项数量
   */
  getCacheSize() {
    return this.hashCache.size;
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(ms)，默认300
 * @param {Object} [opt] - 选项
 * @param {boolean} [opt.leading=false] - 立即执行
 * @param {number} [opt.maxWait] - 最大等待时间
 * @returns {Function} 防抖函数
 */
function debounce(func, wait = 300, opt = {}) {
  let timer = null, lastArgs = null, lastThis = null;

  const run = () => { func.apply(lastThis, lastArgs); lastArgs = lastThis = null; };

  const fn = function(...args) {
    lastArgs = args;
    lastThis = this;
    if (!timer) {
      opt.leading && run();
      const delay = opt.maxWait ? Math.min(wait, opt.maxWait) : wait;
      timer = setTimeout(() => { run(); timer = null; }, delay);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => { run(); timer = null; }, wait);
    }
  };

  fn.cancel = () => { clearTimeout(timer); timer = lastArgs = lastThis = null; };
  fn.flush = () => { timer && (clearTimeout(timer), run(), timer = null); };

  return fn;
}


/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制(ms)，默认300
 * @param {Object} [opt] - 选项
 * @param {boolean} [opt.leading=true] - 立即执行
 * @param {boolean} [opt.trailing=false] - 延迟执行
 * @returns {Function} 节流函数
 */
function throttle(func, limit = 300, opt = {}) {
  let last = 0, timer = null, lastArgs = null, lastThis = null;
  const now = () => performance.now ? performance.now() : Date.now();

  const run = () => { func.apply(lastThis, lastArgs); lastArgs = lastThis = timer = null; };

  return function(...args) {
    const nowTime = now();
    if (!last || nowTime - last >= limit) {
      opt.leading !== false && func.apply(this, args);
      last = nowTime;
    } else if (opt.trailing && !timer) {
      lastArgs = args;
      lastThis = this;
      timer = setTimeout(() => { last = now(); run(); }, limit - (nowTime - last));
    }
  };
}

// 设置 cookie 值的存取和删除
const CookieStorage = {
  // 设置 Cookie
  set(key, value, expireTime) {
    const date = new Date();
    date.setTime(date.getTime() + expireTime * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${key}=${value}; ${expires}; path=/`;
  },
  // 获取 Cookie
  get(key) {
    const name = `${key}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
  },
  // 删除 Cookie
  remove(key) {
    this.set(key, '', -1);

  }
}

export {
  RequestHashGenerator,
  CookieStorage,
  debounce,
  throttle
}