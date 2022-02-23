import { reactive } from "../reactive"

// 测试reactive模块
describe("reactive", ()=> {
    // 测试模块
    it("proxy", ()=> {
        let obj = {test: 123}
        let newObj = reactive(obj)
        expect(newObj).not.toBe(obj)
        expect(newObj.test).toBe(123)
    })
})