import { h } from "../../lib/mini-vue-esm.js"

export const Foo = {
    setup(props) {
        console.log(props.count) //10

        // Set operation on key "count" failed: target is readonly. {count: 10}
        props.count++ 
        
        console.log(props.count) // 10


    },
    render() {
        let d = h('h2',{ class: 'blue'}, 'foo:' + this.count)
        return d
    }
}