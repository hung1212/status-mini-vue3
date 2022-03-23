import { ShapeFlags } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function renderer(vnode, container) {
    patch(vnode, container, null)
}  

function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode
    switch(type) {
        case Fragment:
            processFragment(vnode, container, parentComponent)
            break;
        case Text:
            processText(vnode, container)
            break;
        default:
            // vnod有element和component
            // processElement()
            // 怎么判断是element还是component？？？
            // 字符串的为element类型 'div'
            if(shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent)
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent)
            }
    }
}

function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent)
}

function processText(vnode, container) {
    const { children } = vnode
    let el = (vnode.el = document.createTextNode(children))
    container.append(el)
}

function processElement(vnode, container, parentComponent) {
    // 挂载element类型的组件
    mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
    const { type, props, children  } = vnode
    // 1 创建元素
    const el = (vnode.el = document.createElement(type))
    // 2 添加元素属性
    for(let key in props) {
        let val = props[key]
        const isOn = (key: string)=> /^on[A-Z]/.test(key)
        if(isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }
    // 3 处理元素子节点
    if(typeof children === 'string') {
        el.textContent = children
    } else if(Array.isArray(children)) {
        mountChildren(children, el, parentComponent)
    }
    // 4 元素添加到container
    container.append(el)
}


function mountChildren(children, container, parentComponent) {
    // 遍历children递归patch函数
    for(let vnode of children) {
        patch(vnode, container, parentComponent)
    }
}

function processComponent(vnode, container, parentComponent )  {
    // 挂载还是更新？
    // uptateComponent()
    mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVnode, container, parentComponent) {
    // 初始化组件
    const instance = createComponentInstance(initialVnode, parentComponent)

    // 设置component
    setupComponent(instance)
    // 设置render
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    // 调用render函数，获取vnode
    // 调用render函数的this指向proxy
    const subTree = instance.render.call(proxy)
    // 触发生命周期beforeMount hoot
    // 调用patch初始化子组件（递归）
    patch(subTree, container, instance)
    // console.log(instance)
    // console.log(subTree)
    // 调用生命周期mount hoot
    initialVnode.el = subTree.el
}