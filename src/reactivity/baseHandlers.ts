import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGetter = createGetter(true)
function createGetter(isReadonly = false) {
    return function get(target, props) {
        let res = Reflect.get(target, props)
        if(!isReadonly) {
            // 收集依赖
            track(target, props)
        }
        return res
    }
}

function createSetter() {
    return function set(target, props, value) {
        let res = Reflect.set(target, props, value)
        // 触发依赖
        trigger(target, props)
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
