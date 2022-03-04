import { computed } from "../computed"
import { reactive } from "../reactive"

describe('computed',()=> {
    it('should return updated value',()=> {
        const value = reactive({})
        let cValue = computed(()=> value.foo)
        expect(cValue.value).toBe(undefined)
        value.foo = 2
        expect(cValue.value).toBe(2)
    })
    it('should compute lazily',()=> {
        const value = reactive({})
        const getter = jest.fn(()=> value.foo)
        const cValue = computed(getter)

        // lazy
        expect(getter).not.toHaveBeenCalled()

        // 获取值的时候在计算
        expect(cValue.value).toBe(undefined)
        expect(getter).toHaveBeenCalledTimes(1)

        // 不需要再计算
        cValue.value
        expect(getter).toHaveBeenCalledTimes(1)

        // 在value被获取之前不需要计算
        value.foo = 10
        expect(getter).toHaveBeenCalledTimes(1)

        // 获取的时候计算
        expect(cValue.value).toBe(10)
        expect(getter).toHaveBeenCalledTimes(2)

         // 不需要再计算
        cValue.value
        expect(getter).toHaveBeenCalledTimes(2)

    })
})