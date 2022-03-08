import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

// 创建component install对象
export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }

    return component
}

export function setupComponent(instance) {
    // initPorps
    // initSlots
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.type
    instance.proxy = new Proxy({_:instance}, PublicInstanceProxyHandlers)
    const { setup }  = Component
    if(setup) {
        let setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    // function object
    // TODD function
    if(typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finisComponentSetup(instance)
}

// 完成组件
function finisComponentSetup(instance) {
    const Component = instance.type
    instance.render = Component.render
}
