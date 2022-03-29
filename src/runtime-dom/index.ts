import { createRender } from "../runtime-core/renderer";

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, val) {
    const isOn = (key: string)=> /^on[A-Z]/.test(key)
    if(isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase()
        el.addEventListener(event, val)
    } else {
        el.setAttribute(key, val)
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