/**
 * 前端错误监控工具
 * 功能：
 * 1. 自动收集运行时错误
 * 2. 自动收集 Promise 未捕获错误
 * 3. 自动收集资源加载错误
 * 4. 支持上报到服务器
 * 5. 收集完整的用户上下文信息（URL、操作轨迹、设备、网络状态等）
 */

class ErrorMonitor {
  constructor() {
    this.isInitialized = false
    this.errorQueue = []
    this.maxQueueSize = 50
    this.reportUrl = null

    // 用户行为轨迹
    this.userActions = []
    this.maxActionSize = 20 // 最多保留最近 20 个操作

    // 页面浏览历史
    this.pageHistory = []
    this.maxPageHistorySize = 10

    // 性能指标
    this.performanceMetrics = null
  }

  /**
   * 初始化错误监控
   * @param {Object} options - 配置选项
   * @param {string} options.reportUrl - 错误上报接口地址
   * @param {boolean} options.enableConsole - 是否同时在控制台输出
   * @param {Function} options.onError - 错误发生时的回调函数
   * @param {boolean} options.trackUserActions - 是否追踪用户操作
   * @param {boolean} options.collectPerformance - 是否收集性能指标
   */
  init(options = {}) {
    if (this.isInitialized) return

    this.reportUrl = options.reportUrl || null
    this.enableConsole = options.enableConsole !== false
    this.onError = options.onError || null
    this.trackUserActions = options.trackUserActions !== false
    this.collectPerformance = options.collectPerformance !== false

    // 捕获全局 JavaScript 错误
    this._captureGlobalErrors()

    // 捕获未处理的 Promise rejection
    this._captureUnhandledRejections()

    // 捕获资源加载错误
    this._captureResourceErrors()

    // 捕获 Vue 错误
    this._captureVueErrors()

    // 监听用户行为
    if (this.trackUserActions) {
      this._trackUserActions()
    }

    // 监听路由变化
    this._trackRouteChanges()

    // 收集性能指标
    if (this.collectPerformance) {
      this._collectPerformanceMetrics()
    }

    this.isInitialized = true

    console.log('✅ 错误监控已启动')
  }

  /**
   * 获取设备信息
   */
  _getDeviceInfo() {
    return {
      // 浏览器信息
      userAgent: navigator.userAgent,
      browser: this._getBrowserInfo(),

      // 操作系统
      os: this._getOSInfo(),

      // 屏幕信息
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
      },

      // 窗口信息
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },

      // 语言和环境
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,

      // 硬件信息
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown'
    }
  }

  /**
   * 获取浏览器信息
   */
  _getBrowserInfo() {
    const ua = navigator.userAgent
    let browser = 'Unknown'
    let version = 'Unknown'

    if (ua.includes('Firefox/')) {
      browser = 'Firefox'
      version = ua.match(/Firefox\/([\d.]+)/)?.[1]
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      browser = 'Chrome'
      version = ua.match(/Chrome\/([\d.]+)/)?.[1]
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = 'Safari'
      version = ua.match(/Version\/([\d.]+)/)?.[1]
    } else if (ua.includes('Edg/')) {
      browser = 'Edge'
      version = ua.match(/Edg\/([\d.]+)/)?.[1]
    }

    return { name: browser, version }
  }

  /**
   * 获取操作系统信息
   */
  _getOSInfo() {
    const ua = navigator.userAgent
    let os = 'Unknown'
    let version = 'Unknown'

    if (ua.includes('Windows NT')) {
      os = 'Windows'
      const versionMap = {
        '10.0': '10',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7'
      }
      version = versionMap[ua.match(/Windows NT ([\d.]+)/)?.[1]] || 'Unknown'
    } else if (ua.includes('Mac OS X')) {
      os = 'macOS'
      version = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.')
    } else if (ua.includes('Android')) {
      os = 'Android'
      version = ua.match(/Android ([\d.]+)/)?.[1]
    } else if (ua.includes('iPhone OS') || ua.includes('iPad')) {
      os = 'iOS'
      version = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.')
    } else if (ua.includes('Linux')) {
      os = 'Linux'
    }

    return { name: os, version }
  }

  /**
   * 获取网络状态
   */
  _getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (!connection) {
      return {
        online: navigator.onLine,
        type: 'unknown',
        effectiveType: 'unknown',
        downlink: 'unknown',
        rtt: 'unknown'
      }
    }

    return {
      online: navigator.onLine,
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown', // 4g, 3g, 2g, slow-2g
      downlink: connection.downlink || 'unknown', // 下行速度 (Mbps)
      rtt: connection.rtt || 'unknown', // 往返时延 (ms)
      saveData: connection.saveData || false // 是否开启省流模式
    }
  }

  /**
   * 获取当前页面信息
   */
  _getPageInfo() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    }
  }

  /**
   * 收集性能指标
   */
  _collectPerformanceMetrics() {
    try {
      const perf = performance.getEntriesByType('navigation')[0]
      if (perf) {
        this.performanceMetrics = {
          // 页面加载时间
          domContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
          loadComplete: perf.loadEventEnd - perf.fetchStart,

          // DNS 查询时间
          dnsLookup: perf.domainLookupEnd - perf.domainLookupStart,

          // TCP 连接时间
          tcpConnect: perf.connectEnd - perf.connectStart,

          // 首字节时间
          ttfb: perf.responseStart - perf.requestStart,

          // DOM 解析时间
          domParse: perf.domComplete - perf.domInteractive,

          // 资源数量
          resourceCount: performance.getEntriesByType('resource').length
        }
      }
    } catch (e) {
      console.warn('⚠️ 收集性能指标失败:', e)
    }
  }

  /**
   * 追踪用户操作
   */
  _trackUserActions() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target
      this._recordAction({
        type: 'click',
        target: this._getElementInfo(target),
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })
    }, true)

    // 键盘事件
    document.addEventListener('keydown', (event) => {
      // 忽略修饰键
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return

      this._recordAction({
        type: 'keydown',
        key: event.key,
        target: this._getElementInfo(event.target),
        timestamp: Date.now()
      })
    }, true)

    // 表单输入
    document.addEventListener('input', (event) => {
      const target = event.target
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this._recordAction({
          type: 'input',
          target: {
            tag: target.tagName,
            id: target.id,
            name: target.name,
            type: target.type
          },
          timestamp: Date.now()
        })
      }
    }, true)

    // 滚动事件（节流）
    let scrollTimer = null
    document.addEventListener('scroll', (event) => {
      if (scrollTimer) return

      scrollTimer = setTimeout(() => {
        this._recordAction({
          type: 'scroll',
          target: event.target === document ? 'window' : this._getElementInfo(event.target),
          scrollY: window.scrollY || document.documentElement.scrollTop,
          timestamp: Date.now()
        })
        scrollTimer = null
      }, 500)
    }, true)
  }

  /**
   * 记录用户操作
   */
  _recordAction(action) {
    this.userActions.push(action)
    if (this.userActions.length > this.maxActionSize) {
      this.userActions.shift()
    }
  }

  /**
   * 获取元素信息
   */
  _getElementInfo(element) {
    if (!element || !element.tagName) return 'unknown'

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      text: element.textContent?.substring(0, 50), // 截取前 50 个字符
      name: element.name
    }
  }

  /**
   * 追踪路由变化
   */
  _trackRouteChanges() {
    // 监听 popstate 事件（浏览器前进后退）
    window.addEventListener('popstate', () => {
      this._recordPageView()
    })

    // 监听 hashchange 事件
    window.addEventListener('hashchange', () => {
      this._recordPageView()
    })

    // 记录初始页面
    this._recordPageView()
  }

  /**
   * 记录页面访问
   */
  _recordPageView() {
    const pageInfo = this._getPageInfo()
    this.pageHistory.push(pageInfo)

    if (this.pageHistory.length > this.maxPageHistorySize) {
      this.pageHistory.shift()
    }
  }

  /**
   * 手动记录用户操作（供外部调用）
   * @param actionType 用户操作类型
   * @param details 用户操作详情
   */
  recordAction(actionType, details = {}) {
    this._recordAction({
      type: actionType,
      ...details,
      timestamp: Date.now()
    })
  }

  /**
   * 捕获全局错误
   */
  _captureGlobalErrors() {
    window.addEventListener('error', (event) => {
      if (event.target !== window) return

      const errorInfo = this._buildErrorInfo({
        type: 'runtime_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })

      this._handleError(errorInfo)
    }, true)
  }

  /**
   * 捕获未处理的 Promise rejection
   */
  _captureUnhandledRejections() {
    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo = this._buildErrorInfo({
        type: 'unhandled_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      })

      this._handleError(errorInfo)
      event.preventDefault()
    }, true)
  }

  /**
   * 捕获资源加载错误
   */
  _captureResourceErrors() {
    window.addEventListener('error', (event) => {
      if (event.target === window) return

      const target = event.target
      const errorInfo = this._buildErrorInfo({
        type: 'resource_error',
        tagName: target.tagName,
        src: target.src || target.href,
        message: `Failed to load resource: ${target.src || target.href}`
      })

      this._handleError(errorInfo)
    }, true)
  }

  /**
   * 捕获 Vue 错误
   */
  _captureVueErrors() {
    this.captureVueError = (err, instance, info) => {
      const errorInfo = this._buildErrorInfo({
        type: 'vue_error',
        message: err.message,
        stack: err.stack,
        component: instance?.$options?.name || 'Anonymous',
        vueInfo: info
      })

      this._handleError(errorInfo)
    }
  }

  /**
   * 构建完整的错误信息（包含上下文）
   */
  _buildErrorInfo(errorData) {
    return {
      // 错误基本信息
      ...errorData,

      // 时间戳
      timestamp: Date.now(),

      // 页面信息
      page: this._getPageInfo(),

      // 设备信息
      device: this._getDeviceInfo(),

      // 网络状态
      network: this._getNetworkInfo(),

      // 用户操作轨迹（最近的操作）
      userActions: [...this.userActions],

      // 页面浏览历史
      pageHistory: [...this.pageHistory],

      // 性能指标
      performance: this.performanceMetrics
    }
  }

  /**
   * 处理错误
   */
  _handleError(errorInfo) {
    // 在控制台输出
    if (this.enableConsole) {
      console.error('🐛 [错误监控]', {
        message: errorInfo.message,
        type: errorInfo.type,
        page: errorInfo.page,
        device: errorInfo.device,
        network: errorInfo.network,
        actions: errorInfo.userActions.slice(-5), // 只显示最近 5 个操作
        stack: errorInfo.stack
      })
    }

    // 添加到队列
    this.errorQueue.push(errorInfo)
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // 调用自定义回调
    if (this.onError) {
      try {
        this.onError(errorInfo)
      } catch (e) {
        console.error('❌ onError 回调执行失败:', e)
      }
    }

    // 上报到服务器
    if (this.reportUrl) {
      this._reportError(errorInfo)
    }

    // 保存到 localStorage
    this._saveToLocalStorage(errorInfo)
  }

  /**
   * 上报错误到服务器
   */
  async _reportError(errorInfo) {
    try {
      await fetch(this.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      })
    } catch (e) {
      console.warn('⚠️ 错误上报失败:', e)
    }
  }

  /**
   * 保存错误到 localStorage
   */
  _saveToLocalStorage(errorInfo) {
    try {
      const key = 'error_monitor_logs'
      const logs = JSON.parse(localStorage.getItem(key) || '[]')
      logs.push(errorInfo)

      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }

      localStorage.setItem(key, JSON.stringify(logs))
    } catch (e) {
      console.warn('⚠️ 保存错误日志失败:', e)
    }
  }

  /**
   * 获取最近的错误日志
   */
  getRecentErrors(count = 10) {
    try {
      const key = 'error_monitor_logs'
      const logs = JSON.parse(localStorage.getItem(key) || '[]')
      return logs.slice(-count)
    } catch (e) {
      console.warn('⚠️ 读取错误日志失败:', e)
      return []
    }
  }

  /**
   * 清空错误日志
   */
  clearErrors() {
    try {
      localStorage.removeItem('error_monitor_logs')
      this.errorQueue = []
      this.userActions = []
      this.pageHistory = []
    } catch (e) {
      console.warn('⚠️ 清空错误日志失败:', e)
    }
  }

  /**
   * 导出错误日志（用于问题排查）
   */
  exportErrors() {
    const errors = this.getRecentErrors(100)
    return {
      exportTime: new Date().toISOString(),
      errors,
      summary: {
        total: errors.length,
        byType: {
          runtime: errors.filter(e => e.type === 'runtime_error').length,
          promise: errors.filter(e => e.type === 'unhandled_rejection').length,
          resource: errors.filter(e => e.type === 'resource_error').length,
          vue: errors.filter(e => e.type === 'vue_error').length
        }
      }
    }
  }
}

// 导出单例
export default new ErrorMonitor()