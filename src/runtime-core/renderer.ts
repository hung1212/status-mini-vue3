import { isObject } from "../shared/index"
import { createComponentInstall, setupComponent } from "./component"

export function renderer(vnode, container) {
    patch(vnode, container)
}  

function patch(vnode, container) {
    // vnod有element和component
    // processElement()
    // 怎么判断是element还是component？？？
    // 字符串的为element类型 'div'
    if(typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if(typeof isObject(vnode.type)) {
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
    const el = document.createElement(type)
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

function mountComponent(vnode, container) {
    // 初始化组件
    const install = createComponentInstall(vnode)

    // 设置component
    setupComponent(install)
    // 设置render
    setupRenderEffect(install, container)
}

function setupRenderEffect(install, container) {
    // 调用render函数，获取vnode
    const subTree = install.render()
    // 触发生命周期beforeMount hoot
    // 调用patch初始化子组件（递归）
    patch(subTree, container)
    // 调用生命周期mount hoot
}