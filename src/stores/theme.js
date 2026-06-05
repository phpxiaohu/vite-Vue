import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem('currentTheme') || 'default', // 默认为主题 default
    themes: ['default', 'green', 'glory', 'dark']
  }),
  getters: {
    // 获取当前主题
    getCurrentTheme: (state) => state.currentTheme,
    // 获取所有主题
    getAllThemes: (state) => state.themes,
    // 获取当前主题类名
    getCurrentThemeClass: (state) => {
      return state.currentTheme
    }
  },
  actions: {
    // 切换主题
    toggleTheme(themeName = 'default') {
      // 检查主题名称是否存在
      if (this.themes.includes(themeName)) {
        this.currentTheme = themeName
      } else {
        console.warn(`Theme "${themeName}" does not exist`)
        return
      }

      // 应用主题到DOM
      this.applyTheme()

      // 保存主题设置到本地存储
      localStorage.setItem('currentTheme', this.currentTheme)
    },

    // 应用主题到DOM
    applyTheme() {
      // 移除所有主题类名
      this.themes.forEach(theme => {
        document.documentElement.classList.remove(theme)
      })

      // 添加当前主题类名
      document.documentElement.classList.add(this.currentTheme)
    },

    // 初始化主题（从本地存储设置）
    initTheme() {
      // 检查本地存储中的主题是否有效
      const storedTheme = localStorage.getItem('currentTheme')
      if (storedTheme && this.themes.includes(storedTheme)) {
        this.currentTheme = storedTheme
      }

      // 应用初始主题
      this.applyTheme()
    }
  }
})