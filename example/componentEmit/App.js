import { h } from "../../lib/mini-vue-esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    let app = h("div", {}, "App")
    // emit
    return h("div", {}, [
      h(Foo, {
        onAdd(a, b) {
          console.log("onAdd", a, b);
        },
        onAddFoo() {
          console.log("onAddFoo");
        },
      }),
      h('div', {}, 'div' + app)
    ]);
  },

  setup() {
    return {};
  },
};