import { h } from '../../lib/mini-vue-esm.js'
import TextToText from './TextToText.js'

export default {
    setup() {

    },
    render() {
        return h('div', {}, [
            h('div', {}, '主页'),
            // 旧的是Text
            // 新的也是Text
            h(TextToText)
        ])
    }
}