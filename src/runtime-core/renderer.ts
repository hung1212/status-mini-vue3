import { ShapeFlags } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function renderer(vnode, container) {
    patch(vnode, container)
}  

function patch(vnode, container) {
    const { shapeFlag } = vnode
    // vnod有element和component
    // processElement()
    // 怎么判断是element还是component？？？
    // 字符串的为element类型 'div'
    if(shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
    }
}

function processElement(vnode, container) {
    // 挂载element类型的组件
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    const { type, props, children  } = vnode
    // 1 创建元素
    const el = (vnode.el = document.createElement(type))
    // 2 添加元素属性
    for(let key in props) {
        let val = props[key]
        el.setAttribute(key, val)
    }
    // 3 处理元素子节点
    if(typeof children === 'string') {
        el.textContent = children
    } else if(Array.isArray(children)) {
        mountChildren(children, el)
    }
    // 4 元素添加到container
    container.append(el)
}


function mountChildren(children, container) {
    // 遍历children递归patch函数
    for(let vnode of children) {
        patch(vnode, container)
    }
}

function processComponent(vnode, container )  {
    // 挂载还是更新？
    // uptateComponent()
    mountComponent(vnode, container)
}

function mountComponent(initialVnode, container) {
    // 初始化组件
    const instance = createComponentInstance(initialVnode)

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
    patch(subTree, container)
    console.log(instance)
    console.log(subTree)
    // 调用生命周期mount hoot
    initialVnode.el = subTree.el
}