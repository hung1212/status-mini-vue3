import { h } from '../../lib/mini-vue-esm.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
import ArrayToText from './ArrayToText.js'

export default {
    setup() {

    },
    render() {
        return h('div', {}, [
            h('div', {}, '主页'),
            // 旧的是Text
            // 新的也是Text
            // h(TextToText),

            // 旧的是Text
            // 老的是Array
            // h(TextToArray),

            // 旧的是Array
            // 老的是Text
            h(ArrayToText)
        ])
    }
}