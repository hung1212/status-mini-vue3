import { mutableHandlers, readonlyHandlers } from './baseHandlers'
export function reactive(obj) {
  return createReactiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
  return createReactiveObject(obj, readonlyHandlers)
} 

function createReactiveObject(taw, baseHandlers) {
  return new Proxy(taw, baseHandlers)
}