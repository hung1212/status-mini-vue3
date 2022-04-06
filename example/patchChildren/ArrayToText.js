import { ref, h } from '../../lib/mini-vue-esm.js'

const oldChild = [
    h('div', {}, '123'),
    h('dvi', {}, "321")
]
const newChild = 'old value'

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