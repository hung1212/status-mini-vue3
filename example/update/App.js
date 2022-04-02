import { h, ref } from "../../lib/mini-vue-esm.js"

export const App = {
    setup() {
        const count = ref(0)

        const onClick = ()=> {
            count.value++
        }

        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })

        const onChangePropsDom1 = ()=> {
            props.value.foo = 'new-foo'
        }

        const onChangePropsDom2 = ()=> {
            props.value.foo = undefined
        }

        const onChangePropsDom3 = ()=> {
            props.value = {
                foo: 'foo'
            }
        }
        return {
            count, 
            onClick,
            props,
            onChangePropsDom1,
            onChangePropsDom2,
            onChangePropsDom3
        }
    },
    render() {
        return h('div',{
                id: 'props',
                ...this.props
            },[
            h('div', {}, this.count),
            h('button',{
                onClick: this.onClick
            }, 'click'),
            h('button', {
                onClick: this.onChangePropsDom1
            }, 'changeProps --- 修改'),
            h('button', {
                onClick: this.onChangePropsDom2
            }, 'changeProps --- foo == undefined 删除了'),
            h('button', {
                onClick: this.onChangePropsDom2
            }, 'changeProps --- key 在新的里面没有了 删除')
        ])
    }
}