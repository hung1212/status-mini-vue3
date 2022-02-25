
// 创建一个依赖
class ReactiveEffect {
    private fn
    public scheduler: Function | undefined
    constructor(fn, scheduler?: Function) {
        this.fn = fn
        this.scheduler = scheduler
    }
    run() {
        return this.fn()
    }
}

// 当前的依赖
let activeReactive
// 创建一个弱内存
let targetMap = new WeakMap()

type effectOtions = {
    scheduler?: Function
}

export function effect(fn, options: effectOtions = {}) {
    let _effect = new ReactiveEffect(fn, options.scheduler)
    activeReactive = _effect
    // 执行run就是执行fn
    _effect.run()

    return _effect.run.bind(_effect)
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

    // 把依赖存进当前结构的deps里
    deps.add(activeReactive)
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