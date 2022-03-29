import { createVNode } from "./vnode"

export function createAppAPI(renderer) {
    return function createApp(rootComponent) {
        return {
            mount(rootComtainer) {
                // 把rootComponent转换为虚拟dom
                const vnode = createVNode(rootComponent)
    
                renderer(vnode, rootComtainer)
            }
        }
    }
}