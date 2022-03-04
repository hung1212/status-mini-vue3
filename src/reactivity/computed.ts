import { ReactiveEffect } from './effect'

class ComputedRefImpl {
    // 脏数据 需要重新执行getters
    public _dirty = true
    private _value:any
    public _effect
    constructor(getters) {
        this._effect = new ReactiveEffect(getters, ()=> {
            // 执行scheduler 说明getters的数据有变化，需要更新脏数据
            if(!this._dirty) {
                this._dirty = true
            }
        })
    }
    get value() {
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