import { isObject } from '../shared';
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'
export function reactive(obj) {
  return createReactiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
  return createReactiveObject(obj, readonlyHandlers)
} 

export function shallowReadonly(obj) {
  return createReactiveObject(obj, shallowReadonlyHandlers)
}

function createReactiveObject(taw, baseHandlers) {
  // taw必须是对象 props有可能是undefined
  if (!isObject(taw)) {
    console.warn(`target ${taw} 必须是一个对象`);
    return taw
  }
  return new Proxy(taw, baseHandlers)
}

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return !!value[ReactiveFlags.IS_REACTIVE] || !!value[ReactiveFlags.IS_READONLY]
}