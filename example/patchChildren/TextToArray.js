import { ref, h } from '../../lib/mini-vue-esm.js'

const oldChild = 'old value textToArray'
const newChild = [
    h('div', {}, '123'),
    h('dvi', {}, "321")
]

export default {
    setup() {
        let isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render() {
        return h('div', {}, this.isChange ? newChild : oldChild)
    }
}