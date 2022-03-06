'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function renderer(vnode, rootComtainer) {
    path(vnode, rootComtainer);
}
function path(vnode, rootComponent) {
    processComponent(vnode, rootComponent);
}
function processComponent(vnode, rootComponent) {
    console.log(vnode, rootComponent);
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

function h() {
    console.log('h');
}

exports.createApp = createApp;
exports.h = h;
