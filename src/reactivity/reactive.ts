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