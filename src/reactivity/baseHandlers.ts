import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGetter = createGetter(true)
function createGetter(isReadonly = false) {
    return function get(target, key) {
        if(key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if(key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        let res = Reflect.get(target, key)
        if(!isReadonly) {
            // 收集依赖
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        let res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGetter,
    set(target, key) {
        console.warn(
            `Set operation on key "${String(key)}" failed: target is readonly.`,
            target
        )
        return true
    }
}
