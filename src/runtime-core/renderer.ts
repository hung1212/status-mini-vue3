import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"


export function createRender(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options

    function renderer(vnode, container) {
        patch(null, vnode, container, null)
    }  
    
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2
        switch(type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                // vnod有element和component
                // processElement()
                // 怎么判断是element还是component？？？
                // 字符串的为element类型 'div'
                if(shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
        }
    }
    
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }
    
    function processText(n1, n2 , container) {
        const { children } = n2
        let el = (n2.el = document.createTextNode(children))
        container.append(el)
    }
    
    function processElement(n1, n2, container, parentComponent) {
        if(!n1) {
            // 挂载element类型的组件
            mountElement(n2, container, parentComponent)
        } else {
            // 更新
            patchElement(n1, n2, container)
        }
    }
    
    function mountElement(vnode, container, parentComponent) {
        const { type, props, children, shapeFlag  } = vnode
        // 1 创建元素
        const el = (vnode.el = hostCreateElement(type))
        // 2 添加元素属性
        for(let key in props) {
            let val = props[key]
            hostPatchProp(el, key, val)
        }
        // 3 处理元素子节点
        if( shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }
        // 4 元素添加到container
        hostInsert(el, container)
    }

    function patchElement(n1, n2, container) {
        console.log('patchElement')
        console.log('n1', n1)
        console.log('n2', n2)
    }
    
    
    function mountChildren(vnode, container, parentComponent) {
        // 遍历children递归patch函数
        for(let v of vnode.children) {
            patch(null, v, container, parentComponent)
        }
    }
    
    function processComponent(n1, n2, container, parentComponent )  {
        // 挂载还是更新？
        // uptateComponent()
        mountComponent(n2, container, parentComponent)
    }
    
    function mountComponent(initialVnode, container, parentComponent) {
        // 初始化组件
        const instance = createComponentInstance(initialVnode, parentComponent)
    
        // 设置component
        setupComponent(instance)
        // 设置render
        setupRenderEffect(instance, initialVnode, container)
    }
    
    function setupRenderEffect(instance, initialVnode, container) {
        effect(()=> {

            // 挂载
            if(!instance.isMounted) {
                const { proxy } = instance
                // 调用render函数，获取vnode
                // 调用render函数的this指向proxy
                const subTree = (instance.subTree = instance.render.call(proxy))
                // 触发生命周期beforeMount hoot
                // 调用patch初始化子组件（递归）
                patch(null, subTree, container, instance)
                // console.log(instance)
                // console.log(subTree)
                // 调用生命周期mount hoot
                initialVnode.el = subTree.el

                instance.isMounted = true
            } else {
                // 更新
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                patch(prevSubTree, subTree, container, instance)
            }
        })
    }

    return {
        createApp: createAppAPI(renderer)
    }
}