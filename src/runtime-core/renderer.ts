import { createComponentInstall, setupComponent } from "./component"

export function renderer(vnode, container) {
    path(vnode, container)
}  

function path(vnode, container) {
    // vnod有element和component
    // processElement()
    // 怎么判断是element还是component？？？
    processComponent(vnode, container)
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
    // 临时渲染一下
    let dom = document.querySelector(container)
    dom.innerHTML = install.setupState.msg
    // 触发生命周期beforeMount hoot
    // 调用path初始化子组件（递归）
    // path(subTree, container)
    // 调用生命周期mount hoot
}