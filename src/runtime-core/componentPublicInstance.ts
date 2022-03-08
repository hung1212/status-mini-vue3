export const PublicInstanceProxyHandlers = {
    get({_:instance}, key) {
        const { setupState } = instance
        if(key in setupState) {
            return setupState[key]
        }
    } 
}