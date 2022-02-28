import { extend } from '../shared'
// 创建一个依赖
class ReactiveEffect {
    deps: any = [] 
    active: boolean = true
    onStop?: Function
    private fn
    public scheduler: Function | undefined
    constructor(fn, scheduler?: Function) {
        this.fn = fn
        this.scheduler = scheduler
    }
    run() {
        if(!this.active) {
            return this.fn()
        }

        try {
            activeEffect = this
            shouldTrack = true
            return this.fn()
        } finally {
            // active为ture 所以shouldTrack必然是false
            shouldTrack = false
        }
    }

    stop() {
        if(this.active) {
            cleanupEffect(this)
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    const { deps } = effect
    for(let i = 0; i < deps.length; i++) {
        deps[i].delete(effect)
    }

    deps.length = 0
}

// 创建一个弱内存
let targetMap = new WeakMap()

let shouldTrack = true // 默认需要收集依赖
// 当前的依赖
let activeEffect

type effectOtions = {
    scheduler?: Function,
    onStop?: Function
}

export function effect(fn, options: effectOtions = {}) {
    let _effect = new ReactiveEffect(fn, options.scheduler)
    extend(_effect, options)
    // 执行run就是执行fn
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

// 收集依赖
export function track(target, props) {
    if(!shouldTrack || !activeEffect) return
    // 一个树形结构
    // depsMap ==》 deps ==》 activeEffect
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        targetMap.set(target, ( depsMap = new Map()))
    }

    let deps = depsMap.get(props)
    if(!deps) {
        depsMap.set(props, (deps = new Set()))
    }

    // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
    if (deps.has(activeEffect)) return;
    // 把依赖存进当前结构的deps里
    deps.add(activeEffect)
    // 收集会触发activeEffect的deps 清除需要
    activeEffect.deps.push(deps)
}

// 触发依赖
export function trigger(target, props) {
    let depsMap = targetMap.get(target)
    // 当前分支没有依赖的函数
    if(!depsMap) return
    let deps = depsMap.get(props)
    if(!deps) return

    deps && deps.forEach(effect => {
        if(effect.scheduler) {
            effect.scheduler()
        } else {
            // 把deps的所有依赖取出来执行
            effect.run()
        }
    })
}

// 要清除的effect
export function stop(runner) {
    runner.effect.stop()
}