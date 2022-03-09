'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
    }
};

// 创建component install对象
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // initPorps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function object
    // TODD function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finisComponentSetup(instance);
}
// 完成组件
function finisComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}

function renderer(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    var shapeFlag = vnode.shapeFlag;
    // vnod有element和component
    // processElement()
    // 怎么判断是element还是component？？？
    // 字符串的为element类型 'div'
    console.log(vnode, shapeFlag & 1 /* ELEMENT */);
    console.log(vnode, shapeFlag & 2 /* STATEFUL_COMPONENT */);
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 挂载element类型的组件
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, props = vnode.props, children = vnode.children;
    // 1 创建元素
    var el = (vnode.el = document.createElement(type));
    // 2 添加元素属性
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    // 3 处理元素子节点
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // 4 元素添加到container
    container.append(el);
}
function mountChildren(children, container) {
    // 遍历children递归patch函数
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var vnode = children_1[_i];
        patch(vnode, container);
    }
}
function processComponent(vnode, container) {
    // 挂载还是更新？
    // uptateComponent()
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    // 初始化组件
    var instance = createComponentInstance(initialVnode);
    // 设置component
    setupComponent(instance);
    // 设置render
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    var proxy = instance.proxy;
    // 调用render函数，获取vnode
    // 调用render函数的this指向proxy
    var subTree = instance.render.call(proxy);
    // 触发生命周期beforeMount hoot
    // 调用patch初始化子组件（递归）
    patch(subTree, container);
    console.log(instance);
    console.log(subTree);
    // 调用生命周期mount hoot
    initialVnode.el = subTree.el;
}

function isString(val) {
    return typeof val === 'string';
}
function isArray(val) {
    return Array.isArray;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (isArray()) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return isString(type)
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */; // 2
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

exports.createApp = createApp;
exports.h = h;
