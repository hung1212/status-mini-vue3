import { ref, h } from '../../lib/mini-vue-esm.js'

const oldChild = 'old value'
const newChild = 'new value'

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