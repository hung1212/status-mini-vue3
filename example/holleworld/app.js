import { h } from '../../lib/mini-vue-esm.js'
export const App = {
    render() {
        h('div', 'hi ', + this.msg)
    },
    setUp() {
        return {
            msg: 'mini-vue3'
        }
    }
}