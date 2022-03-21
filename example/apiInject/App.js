import { h } from "../../lib/mini-vue-esm"

const Provide = {
    setup() {
        provide('foo', 'fooVal')
        provide('bar', 'barVal')
    },
    render() {
        return h('div', {}, [ h('div', {}, 'provide'), ])
    }
}

const ProvedeTwo = {
    setup() {
        provide('foo', 'fooValTwo')
        let foo =  injecy('foo')
        console.log('ProvideTwo', foo)
        return {
            foo
        }
    },
    render() {
        return h('div', {}, [ 
            h('div', {}, 'provideTwo' + this.foo), 
            h(Inject)
        ])
    }
}

const Inject = {
    setup() {
        let foo = injecy('foo')
        let bar = injecy('bar')
            // const baz = inject("baz", "bazDefault");
        const baz = inject("baz", () => "bazDefault");
        return {
            foo,
            bar,
            baz
        }
    },
    render() {
        return h('div', {}, [ 
            h('div', {}, 'InjectFoo' + this.foo), 
            h('div', {}, 'InjectBar' + this.bar),
            h('div', {}, 'InjectBaz' + this.baz),
        ])
    }
}

export default {
    name: 'App',
    setup() {},
    render() {
       return h('div', {}, [ h('div', {}, 'App'), h(Provide)])
    }
}