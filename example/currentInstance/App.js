import { getCurrentInstance, h } from "../../lib/mini-vue-esm.js"
import { Foo } from "./Foo.js"

export const App = {
    setup() {
        const instance = getCurrentInstance()
        console.log('app', instance)
    },
    render() {
        return h(Foo,{},{
            header: ({arg})=> h('div',{}, arg)
        })
    }
}