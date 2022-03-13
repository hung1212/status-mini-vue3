var extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === 'object';
}
function isString(val) {
    return typeof val === 'string';
}
function isArray(val) {
    return Array.isArray(val);
}
var hasOwn = function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

// 创建一个弱内存
var targetMap = new WeakMap();
// 触发依赖
function trigger(target, props) {
    var depsMap = targetMap.get(target);
    // 当前分支没有依赖的函数
    if (!depsMap)
        return;
    var deps = depsMap.get(props);
    if (!deps)
        return;
    triggerEffects(deps);
}
function triggerEffects(deps) {
    deps && deps.forEach(function (effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            // 把deps的所有依赖取出来执行
            effect.run();
        }
    });
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, isShallowReadonly) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallowReadonly === void 0) { isShallowReadonly = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (isShallowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key) {
        console.warn("Set operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
        return true;
    }
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });

function reactive(obj) {
    return createReactiveObject(obj, mutableHandlers);
}
function readonly(obj) {
    return createReactiveObject(obj, readonlyHandlers);
}
function shallowReadonly(obj) {
    return createReactiveObject(obj, shallowReadonlyHandlers);
}
function createReactiveObject(taw, baseHandlers) {
    // taw必须是对象 props有可能是undefined
    if (!isObject(taw)) {
        console.warn("target ".concat(taw, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
        return taw;
    }
    return new Proxy(taw, baseHandlers);
}

function initProps(instance, rewProps) {
    instance.props = rewProps;
}

// const publicPropertiesMap = {
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 以下代码目前用到 先注释
        // const publicGetter = publicPropertiesMap[key];
        // if (publicGetter) {
        //   return publicGetter(instance);
        // }
    }
};

// 创建component install对象
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    };
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var props = instance.props;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(props));
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
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
    // console.log(instance)
    // console.log(subTree)
    // 调用生命周期mount hoot
    initialVnode.el = subTree.el;
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
    else if (isArray(children)) {
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

export { createApp, h };
