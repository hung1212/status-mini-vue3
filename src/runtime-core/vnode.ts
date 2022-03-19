import { isArray, isObject, isString, ShapeFlags } from "../shared/index"

// Fragment和Text类型
export const Fragment = Symbol('Fragment')
export const Text = Symbol("Text")
export function createVNode(type, props?, children?) {
    const vnode = {
        type, 
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    if(isString(children)) {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if(isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else if(isObject(children)) {
        vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
    return vnode
}

export function createText(text) {
    return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
    return isString(type) 
    ? ShapeFlags.ELEMENT // 1
    : ShapeFlags.STATEFUL_COMPONENT // 2
}