// 创建component install对象
function createComponentInstall(vnode) {
    var install = {
        vnode: vnode,
        type: vnode.type
    };
    return install;
}
function setupComponent(install) {
    // initPorps
    // initSlots
    setupStatefulComponent(install);
}
function setupStatefulComponent(install) {
    var Component = install.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(install, setupResult);
    }
}
function handleSetupResult(install, setupResult) {
    // function object
    // TODD function
    if (typeof setupResult === 'object') {
        install.setupState = setupResult;
    }
    finisComponentSetup(install);
}
// 完成组件
function finisComponentSetup(install) {
    var Component = install.type;
    install.render = Component.render;
}

function renderer(vnode, container) {
    path(vnode, container);
}
function path(vnode, container) {
    // vnod有element和component
    // processElement()
    // 怎么判断是element还是component？？？
    processComponent(vnode, container);
}
function processComponent(vnode, container) {
    // 挂载还是更新？
    // uptateComponent()
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 初始化组件
    var install = createComponentInstall(vnode);
    // 设置component
    setupComponent(install);
    // 设置render
    setupRenderEffect(install, container);
}
function setupRenderEffect(install, container) {
    // 调用render函数，获取vnode
    install.render();
    // 临时渲染一下
    var dom = document.querySelector(container);
    dom.innerHTML = install.setupState.msg;
    // 触发生命周期beforeMount hoot
    // 调用path初始化子组件（递归）
    // path(subTree, container)
    // 调用生命周期mount hoot
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootComtainer) {
            // 把rootComponent转换为虚拟dom
            var vnode = createVNode(rootComponent);
            renderer(vnode, rootComtainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
