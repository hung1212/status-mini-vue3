import { createRender } from "../runtime-core/renderer";

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, pervVal, nextVal) {
    const isOn = (key: string)=> /^on[A-Z]/.test(key)
    if(isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase()
        el.addEventListener(event, nextVal)
    } else {
        if(nextVal === null || nextVal === undefined) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }
    }
}

function insert(child, parent) {
    parent.append(child)
}

const render: any = createRender({
    createElement,
    patchProp,
    insert
})

export function createApp(...args) {
   return render.createApp(...args)
}

export * from '../runtime-core'