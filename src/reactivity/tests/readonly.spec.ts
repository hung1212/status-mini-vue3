import { isProxy, isReadonly, readonly } from "../reactive";
describe("readonly", () => {
    it("should make nested values readonly", () => {
      const original = { foo: 1, bar: { baz: 2 } };
      const wrapped = readonly(original);
      expect(wrapped).not.toBe(original);
      expect(wrapped.foo).toBe(1);
      expect(isReadonly(original)).toBe(false)
      expect(isReadonly(wrapped)).toBe(true)
      expect(isProxy(wrapped)).toBe(true);
    });
  
    it("should call console.warn when set", () => {
      console.warn = jest.fn();
      const user = readonly({
        age: 10,
      });
  
      user.age = 11;
      expect(console.warn).toHaveBeenCalled();
    });

    it('nested redonly', ()=> {
        let original = {
            nested: {
                foo: 1
            },
            array:[{bar: 2}]
        }
        let observed = readonly(original)
        expect(isReadonly(observed.nested)).toBe(true)
        expect(isReadonly(observed.array[0])).toBe(true)
    })
  });