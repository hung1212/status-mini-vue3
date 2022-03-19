import { h, createText } from "../../lib/mini-vue-esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    let app = h("div", {}, "App")
    let foo = h(Foo, {},
      {
        header: ({arg})=> [
          h('div',{},'header'+arg),
          createText('你好呀')
        ],
        footer: ()=> h('div',{}, 'footer')
      }
    )
    return h("div", {},[app, foo])
  },
  setup() {
    return {}
  },
};