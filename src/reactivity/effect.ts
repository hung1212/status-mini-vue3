
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
        return this.fn()
    }

    stop() {
        if(this.active) {
            this.deps.forEach(dep => {
                dep.delete(this)
            })
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

// 当前的依赖
let activeReactive
// 创建一个弱内存
let targetMap = new WeakMap()

type effectOtions = {
    scheduler?: Function,
    onStop?: Function
}

export function effect(fn, options: effectOtions = {}) {
    let _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.onStop = options.onStop
    activeReactive = _effect
    // 执行run就是执行fn
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

// 收集依赖
export function track(target, props) {
    // 一个树形结构
    // depsMap ==》 deps ==》 activeReactive
    let depsMap = targetMap.get(targetMap)
    if(!depsMap) {
        targetMap.set(target, ( depsMap = new Map()))
    }

    let deps = depsMap.get(props)
    if(!deps) {
        depsMap.set(props, (deps = new Set()))
    }

    if(!activeReactive) return
    // 把依赖存进当前结构的deps里
    deps.add(activeReactive)
    // 收集会触发activeReactive的deps 清除需要
    activeReactive.deps.push(deps)
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