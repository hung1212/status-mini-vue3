import { reactive } from '../reactive'
import { effect, stop } from '../effect'
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

    it('should observe multiple properties', () => {
      let dummy
      const counter = reactive({ num1: 0, num2: 0 })
      effect(() => (dummy = counter.num1 + counter.num1 + counter.num2))
  
      expect(dummy).toBe(0)
      counter.num1 = counter.num2 = 7
      expect(dummy).toBe(21)
    })

    // 分支未解决
    // it('checkout', () => {
    //   let fn = jest.fn(()=>{})
    //   let dummy
    //   const counter = reactive({ is: true, foo: 1 })
    //   effect(() =>  {
    //     dummy = counter.is ? counter.foo : 'not'
    //     fn()
    //   })
    //   expect(dummy).toBe(counter.foo)
    //   counter.is = false
    //   expect(fn).toBeCalledTimes(2)
    //   expect(dummy).toBe('not')
    //   counter.foo = 10
    //   expect(fn).toBeCalledTimes(2)
    // })

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

    it("scheduler", ()=> {
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
          run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(
          () => {
            dummy = obj.foo;
          },
          { scheduler }
        );
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // // should not run yet
        expect(dummy).toBe(1);
        // // manually run
        run();
        // // should have run
        expect(dummy).toBe(2);
    })

    it("stop", ()=> {
      let dummy;
      const obj = reactive({ prop: 1 });
      const runner = effect(() => {
        dummy = obj.prop;
      });
      obj.prop = 2;
      expect(dummy).toBe(2);
      stop(runner);
      // obj.prop = 3
      obj.prop++;
      expect(dummy).toBe(2);
  
      // stopped effect should still be manually callable
      runner();
      expect(dummy).toBe(3);
    })

    it("onStop", () => {
      const obj = reactive({
        foo: 1,
      });
      const onStop = jest.fn();
      let dummy;
      const runner = effect(
        () => {
          dummy = obj.foo;
        },
        {
          onStop,
        }
      );
  
      stop(runner);
      expect(onStop).toBeCalledTimes(1);
    });

    it("nested reactive", ()=> {
      let original = {
        nested: {
            foo: 1
        },
        array:[{bar: 2}]
      }
      let observed = reactive(original)
      let runner
      effect(()=> {
        runner = observed.nested.foo
      })
      expect(runner).toBe(1)
      observed.nested.foo = 10
      expect(runner).toBe(10)
    })
})