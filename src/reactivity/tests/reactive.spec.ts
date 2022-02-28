import { isReactive, reactive } from "../reactive"

// 测试reactive模块
describe("reactive", ()=> {
    // 测试模块
    it("proxy", ()=> {
        let obj = {test: 123}
        let newObj = reactive(obj)
        expect(newObj).not.toBe(obj)
        expect(newObj.test).toBe(123)
        expect(isReactive(obj)).toBe(false)
        expect(isReactive(newObj)).toBe(true)
    })

    it("nested isReactive", ()=> {
        let original = {
            nested: {
                foo: 1
            },
            array:[{bar: 2}]
        }
        let observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })
})