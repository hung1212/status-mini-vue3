import { readonlyHandlers } from "../reactivity/baseHandlers"
import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

// 创建component install对象
export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {} 
    }

    return component
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    // initSlots
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.type
    instance.proxy = new Proxy({_:instance}, PublicInstanceProxyHandlers)
    const { props } = instance
    const { setup }  = Component
    if(setup) {
        // props是shallowReadonly数据类型
        let setupResult = setup(shallowReadonly(props))
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
