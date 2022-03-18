import { h, renderSlots } from "../../lib/mini-vue-esm.js";

export const Foo = {
  setup() {},
  render() {
    let foo = h('div', {}, 'foo')

    let arg = 18
    return h("div", {}, [
      renderSlots(this.$slots, 'header', {
        arg
      }),
      foo,
      renderSlots(this.$slots, 'footer')
    ]);
  },
};