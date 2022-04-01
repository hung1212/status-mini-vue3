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
var hasChanged = function (val, newValue) {
    return !Object.is(val, newValue);
};
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

// 创建一个依赖
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this.fn = fn;
        this.scheduler = scheduler;
    }
    ReactiveEffect.prototype.run = function () {
        if (!this.active) {
            return this.fn();
        }
        try {
            activeEffect = this;
            shouldTrack = true;
            return this.fn();
        }
        finally {
            // active为ture 所以shouldTrack必然是false
            shouldTrack = false;
        }
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function cleanupEffect(effect) {
    var deps = effect.deps;
    for (var i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
    }
    deps.length = 0;
}
// 创建一个弱内存
var targetMap = new WeakMap();
var shouldTrack = true; // 默认需要收集依赖
// 当前的依赖
var activeEffect;
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    var _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    // 执行run就是执行fn
    _effect.run();
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
// 收集依赖
function track(target, props) {
    if (!isTracking())
        return;
    // 一个树形结构
    // depsMap ==》 deps ==》 activeEffect
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    var deps = depsMap.get(props);
    if (!deps) {
        depsMap.set(props, (deps = new Set()));
    }
    trackEffects(deps);
}
function trackEffects(deps) {
    // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
    if (deps.has(activeEffect))
        return;
    // 把依赖存进当前结构的deps里
    deps.add(activeEffect);
    // 收集会触发activeEffect的deps 清除需要
    activeEffect.deps.push(deps);
}
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
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
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
        if (!isReadonly) {
            // 收集依赖
            track(target, key);
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
function isReactive(value) {
    return !!value["__v_isReactive" /* IS_REACTIVE */];
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
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
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
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        var type = n2.type, shapeFlag = n2.shapeFlag;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // vnod有element和component
                // processElement()
                // 怎么判断是element还是component？？？
                // 字符串的为element类型 'div'
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        var children = n2.children;
        var el = (n2.el = document.createTextNode(children));
        container.append(el);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // 挂载element类型的组件
            mountElement(n2, container, parentComponent);
        }
        else {
            // 更新
            patchElement(n1, n2);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
        // 1 创建元素
        var el = (vnode.el = hostCreateElement(type));
        // 2 添加元素属性
        for (var key in props) {
            var val = props[key];
            hostPatchProp(el, key, val);
        }
        // 3 处理元素子节点
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        // 4 元素添加到container
        hostInsert(el, container);
    }
    function patchElement(n1, n2, container) {
        console.log('patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
    }
    function mountChildren(vnode, container, parentComponent) {
        // 遍历children递归patch函数
        for (var _i = 0, _a = vnode.children; _i < _a.length; _i++) {
            var v = _a[_i];
            patch(null, v, container, parentComponent);
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        // 挂载还是更新？
        // uptateComponent()
        mountComponent(n2, container, parentComponent);
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
        effect(function () {
            // 挂载
            if (!instance.isMounted) {
                var proxy = instance.proxy;
                // 调用render函数，获取vnode
                // 调用render函数的this指向proxy
                var subTree = (instance.subTree = instance.render.call(proxy));
                // 触发生命周期beforeMount hoot
                // 调用patch初始化子组件（递归）
                patch(null, subTree, container, instance);
                // console.log(instance)
                // console.log(subTree)
                // 调用生命周期mount hoot
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                var proxy = instance.proxy;
                var subTree = instance.render.call(proxy);
                var prevSubTree = instance.subTree;
                instance.subTree.subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
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

var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            trackRefValue(this);
            return this._value;
        },
        set: function (newValue) {
            if (hasChanged(newValue, this._rawValue)) {
                this._rawValue = newValue;
                this._value = convert(newValue);
                triggerRefValue(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!(ref && ref.__v_isRef);
}
function unRef(value) {
    return isRef(value) ? value.value : value;
}
var shallowUnwrapHandlers = {
    get: function (obj, key) {
        return unRef(obj[key]);
    },
    set: function (obj, key, value) {
        var oldValue = obj[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        return Reflect.set(obj, key, value);
    }
};
function proxyRefs(obj) {
    return isReactive(obj) ? obj : new Proxy(obj, shallowUnwrapHandlers);
}
/** @class */ ((function () {
    function ObjectRefImpl(obj, key) {
        this.__v_isRef = true;
        this.obj = obj;
        this.key = key;
    }
    Object.defineProperty(ObjectRefImpl.prototype, "value", {
        get: function () {
            return Reflect.get(this.obj, this.key);
        },
        set: function (val) {
            Reflect.set(this.obj, this.key, val);
        },
        enumerable: false,
        configurable: true
    });
    return ObjectRefImpl;
})());

exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createRender = createRender;
exports.createText = createText;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
