import { effect } from "../effect";
import { reactive } from "../reactive";
import { unRef, isRef, ref, toRef, toRefs } from "../ref";
describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef", ()=> {
    let foo = 1
    let a = ref(foo)
    expect(isRef(foo)).toBe(false)
    expect(isRef(1)).toBe(false)
    expect(isRef(a)).toBe(true)
  })

  it('unRef', ()=> {
    let a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it('toRef', ()=> {
    const state = reactive({
      foo: 1, 
      bar: 2
    })
    const fooRef = toRef(state, 'foo')
    fooRef.value++
    expect(state.foo).toBe(2)

    state.foo++
    expect(fooRef.value).toBe(3)
  })

  it('toRefs', ()=> {
    const a = reactive({
      x: 1,
      y: 2
    })

    const { x, y } = toRefs(a)

    expect(isRef(x)).toBe(true)
    expect(isRef(y)).toBe(true)
    expect(x.value).toBe(1)
    expect(y.value).toBe(2)

    // source -> proxy
    a.x = 2
    a.y = 3
    expect(x.value).toBe(2)
    expect(y.value).toBe(3)

    // proxy -> source
    x.value = 3
    y.value = 4
    expect(a.x).toBe(3)
    expect(a.y).toBe(4)

    // reactivity
    let dummyX, dummyY
    effect(() => {
      dummyX = x.value
      dummyY = y.value
    })
    expect(dummyX).toBe(x.value)
    expect(dummyY).toBe(y.value)

    // mutating source should trigger effect using the proxy refs
    a.x = 4
    a.y = 5
    expect(dummyX).toBe(4)
    expect(dummyY).toBe(5)
  })
});