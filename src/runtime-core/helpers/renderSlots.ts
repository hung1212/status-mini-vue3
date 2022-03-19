import { createVNode, Fragment } from "../vnode"

export function renderSlots(slots, name, props) {
    let slot = slots[name]
    if(slot) {
        return createVNode(Fragment, {}, slot(props))
    }
}