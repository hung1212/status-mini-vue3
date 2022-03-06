export function renderer(vnode, rootComtainer) {
    path(vnode, rootComtainer)
}  

function path(vnode, rootComponent) {
    processComponent(vnode, rootComponent)
}

function processComponent(vnode, rootComponent )  {
    console.log(vnode, rootComponent)
}