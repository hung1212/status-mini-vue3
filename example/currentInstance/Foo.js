import { getCurrentInstance, h } from "../../lib/mini-vue-esm.js"

export const Foo = {
    setup() {
        const instance = getCurrentInstance()
        console.log('foo', instance)
    },
    render() {
        return h('div', {}, 'foo')
    }
        
}