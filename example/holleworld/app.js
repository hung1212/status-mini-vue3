import { h } from '../../lib/mini-vue-esm.js'
export const App = {
    render() {
        return h(
            'div',
            {
                id: 'box',
                class: ['red', 'blue']
            }, 
            [
                h('p', {class: 'red'}, 'hi'),
                h('p', {class: 'blue'}, 'mini-vue')
            ]
        )
    },
    setup() {
        return {
            msg: 'mini-vue3'
        }
    }
}