// 创建component install对象
export function createComponentInstall(vnode) {
    const install = {
        vnode,
        type: vnode.type
    }

    return install
}

export function setupComponent(install) {
    // initPorps
    // initSlots
    setupStatefulComponent(install)
}

function setupStatefulComponent(install) {
    const Component = install.type

    const { setup }  = Component
    if(setup) {
        let setupResult = setup()
        handleSetupResult(install, setupResult)
    }
}

function handleSetupResult(install, setupResult) {
    // function object
    // TODD function
    if(typeof setupResult === 'object') {
        install.setupState = setupResult
    }
    finisComponentSetup(install)
}

// 完成组件
function finisComponentSetup(install) {
    const Component = install.type
    install.render = Component.render
}
