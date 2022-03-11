import { h } from "../../lib/mini-vue-esm.js"

export const Foo = {
    setup(props) {
        console.log(props)
    },
    render() {
        return h('h2',{}, this.count)
    }
}