import { reactive } from '../reactive'
import { effect } from '../effect'
describe('effect', ()=> {
    it("test", ()=> {
        let obj = {sum: 10}
        let newObj = reactive(obj)
        let value
        effect(()=> {
            value = newObj.sum
        })

        expect(value).toBe(10)

        // newObj.sum被赋值的时候会触发相关依赖的effect.run
        newObj.sum++
        expect(value).toBe(11)
    })

    it("return effect", ()=> {
        // 用户可以手动执行expect.run()
        // runner的返回值就是fn的返回值
        let foo = 0
        const runner = effect(()=> {
            foo++
            return foo
        })
        expect(foo).toBe(1)
        runner()
        expect(foo).toBe(2)
        expect(runner()).toBe(3)
    })
})