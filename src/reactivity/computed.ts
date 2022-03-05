import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

class ComputedRefImpl {
    public dep = new Set()
    // 脏数据 需要重新执行getters
    public _dirty = true
    private _value:any
    public _effect
    public _cacheable: boolean = true
    constructor(getters) {
        this._effect = new ReactiveEffect(getters, ()=> {
            // 执行scheduler 说明getters的数据有变化，需要更新脏数据
            if(!this._dirty) {
                this._dirty = true
                this._effect.active = this._cacheable
                // 有脏数据 触发trigger
                triggerRefValue(this)
            }
        })
    }
    get value() {
        // 获取value值 收集依赖
        trackRefValue(this)
        // 脏数据重新计算getters
        if(this._dirty) {
            this._value = this._effect.run()
            this._dirty = false
            return this._value
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}