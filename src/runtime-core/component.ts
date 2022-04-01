import { proxyRefs } from ".."
import { readonlyHandlers } from "../reactivity/baseHandlers"
import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"
import { emit } from "./componrntEmit"

// 创建component install对象
export function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        isMounted: false,
        subTree: {},
        parent,
        emit: ()=> {},
    }

    component.emit = emit.bind(null, component) as any

    return component
}

export function setupComponent(instance) {
    const { props, children } = instance.vnode
    initProps(instance, props)
    initSlots(instance, children)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.type
    instance.proxy = new Proxy({_:instance}, PublicInstanceProxyHandlers)
    const { props } = instance
    const { setup }  = Component
    if(setup) {
        setCurrentInstance(instance)
        // props是shallowReadonly数据类型
        let setupResult = setup(shallowReadonly(props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    // function object
    // TODD function
    if(typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }
    finisComponentSetup(instance)
}

// 完成组件
function finisComponentSetup(instance) {
    const Component = instance.type
    instance.render = Component.render
}

let currentInstance = null
export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance
}