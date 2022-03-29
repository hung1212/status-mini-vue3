'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? "on" + capitalize(str) : "";
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

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; }
};
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
        // 代理组件Api
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(install, children) {
    var shapeFlag = install.vnode.shapeFlag;
    // element类型children为slots
    if (shapeFlag & 16 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, install.slots);
    }
}
function normalizeObjectSlots(rowSlots, slots) {
    var _loop_1 = function (key) {
        var value = rowSlots[key];
        // valie的返回值就是插入的slots vNode类型
        // 存在slots里 给子组建使用
        slots[key] = function (props) { return normalizeSlotsValie(value(props)); };
    };
    // 遍历slots对象
    for (var key in rowSlots) {
        _loop_1(key);
    }
}
function normalizeSlotsValie(value) {
    return isArray(value) ? value : [value];
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    // const { props } = instance
    // console.log(props)
    // console.log(event)
    // console.log(...args)
    var props = instance.props;
    var handlerName = toHandlerKey(camelize(event));
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}

// 创建component install对象
function createComponentInstance(vnode, parent) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent,
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    var _a = instance.vnode, props = _a.props, children = _a.children;
    initProps(instance, props);
    initSlots(instance, children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var props = instance.props;
    var setup = Component.setup;
    if (setup) {
        setCurrentInstance(instance);
        // props是shallowReadonly数据类型
        var setupResult = setup(shallowReadonly(props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
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
var currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

// Fragment和Text类型
var Fragment = Symbol('Fragment');
var Text = Symbol("Text");
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
    else if (isObject(children)) {
        vnode.shapeFlag |= 16 /* SLOTS_CHILDREN */;
    }
    return vnode;
}
function createText(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return isString(type)
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */; // 2
}

function createAppAPI(renderer) {
    return function createApp(rootComponent) {
        return {
            mount: function (rootComtainer) {
                // 把rootComponent转换为虚拟dom
                var vnode = createVNode(rootComponent);
                renderer(vnode, rootComtainer);
            }
        };
    };
}

function createRender(options) {
    var hostCreateElement = options.createElement, hostPatchProp = options.patchProp, hostInsert = options.insert;
    function renderer(vnode, container) {
        patch(vnode, container, null);
    }
    function patch(vnode, container, parentComponent) {
        var type = vnode.type, shapeFlag = vnode.shapeFlag;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                // vnod有element和component
                // processElement()
                // 怎么判断是element还是component？？？
                // 字符串的为element类型 'div'
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
        }
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent);
    }
    function processText(vnode, container) {
        var children = vnode.children;
        var el = (vnode.el = document.createTextNode(children));
        container.append(el);
    }
    function processElement(vnode, container, parentComponent) {
        // 挂载element类型的组件
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        var type = vnode.type, props = vnode.props, children = vnode.children;
        // 1 创建元素
        var el = (vnode.el = hostCreateElement(type));
        // 2 添加元素属性
        for (var key in props) {
            var val = props[key];
            hostPatchProp(el, key, val);
        }
        // 3 处理元素子节点
        if (typeof children === 'string') {
            el.textContent = children;
        }
        else if (Array.isArray(children)) {
            mountChildren(children, el, parentComponent);
        }
        // 4 元素添加到container
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        // 遍历children递归patch函数
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var vnode = children_1[_i];
            patch(vnode, container, parentComponent);
        }
    }
    function processComponent(vnode, container, parentComponent) {
        // 挂载还是更新？
        // uptateComponent()
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(initialVnode, container, parentComponent) {
        // 初始化组件
        var instance = createComponentInstance(initialVnode, parentComponent);
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
        patch(subTree, container, instance);
        // console.log(instance)
        // console.log(subTree)
        // 调用生命周期mount hoot
        initialVnode.el = subTree.el;
    }
    return {
        createApp: createAppAPI(renderer)
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        return createVNode(Fragment, {}, slot(props));
    }
}

function inject(name, defaultValue) {
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var parentProvides = currentInstance.parent.provides;
        if (name in parentProvides) {
            return parentProvides[name];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}
function provide(name, val) {
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var provides = currentInstance.provides;
        var parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[name] = val;
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        var event_1 = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event_1, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(child, parent) {
    parent.append(child);
}
var render = createRender({
    createElement: createElement,
    patchProp: patchProp,
    insert: insert
});
function createApp() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return render.createApp.apply(render, args);
}

exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createRender = createRender;
exports.createText = createText;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
