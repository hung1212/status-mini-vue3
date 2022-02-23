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

        newObj.sum++
        expect(value).toBe(11)
    })
})