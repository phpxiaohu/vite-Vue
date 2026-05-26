import { unref } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { registerPlugins } from './plugins'
import { useThemeStore } from './theme'
import { useUserStore } from './user'
import { useCartStore } from './cart'
// 创建 Pinia 实例
export const pinia = createPinia()
registerPlugins(pinia)
// 创建 store 工厂
const storeFactories = {
  useThemeStore,
  useUserStore,
  useCartStore
}
// 创建 store 获取工厂
export const getStore = (storeName) => {
  const factory = storeFactories[storeName]
  if (!factory) {
    throw new Error(`Store \"${storeName}\" 不存在`)
  }
  const store = factory()
  // 创建代理对象，将 refs 的值解包
  const refs = storeToRefs(store)
  return new Proxy(refs, {
    get(target, key, receiver) {
      // 如果 key 在 refs 中（state 或 getter），返回解包后的值
      if (key in target) {
        return target[key] // ✅ 不解除 Ref，保持响应式
        // return unref(target[key]) // 解包 Ref，返回普通值
      }
      // 如果 key 不在 refs 中（如 actions/methods），从 store 上获取
      const storeValue = Reflect.get(store, key, receiver)
      if (typeof storeValue === 'function') {
        return storeValue.bind(store)
      }
      return storeValue
    }
  })
}

export default pinia