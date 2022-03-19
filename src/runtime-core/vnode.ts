import { isArray, isObject, isString, ShapeFlags } from "../shared/index"
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

function getShapeFlag(type) {
    return isString(type) 
    ? ShapeFlags.ELEMENT // 1
    : ShapeFlags.STATEFUL_COMPONENT // 2
}