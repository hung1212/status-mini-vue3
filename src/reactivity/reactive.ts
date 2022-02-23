import { track, trigger } from './effect'
export const reactive = function (obj) {
  return new Proxy(obj, {
    get(target, props) {
      let res = Reflect.get(target, props)
      // 收集依赖
      track(target, props)
      return res
    },
    set(target, props, value) {
      let res = Reflect.set(target, props, value)
      // 触发依赖
      trigger(target, props)
      return res
    }
  })
}