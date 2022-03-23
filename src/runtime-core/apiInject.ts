import { getCurrentInstance } from "."

export function inject(name, defaultValue) {
    const currentInstance: any = getCurrentInstance()

    if(currentInstance) {
        const parentProvides = currentInstance.parent.provides
        if(name in parentProvides) {
            return parentProvides[name]
        } else if(defaultValue) {
            if(typeof defaultValue === 'function') {
                return defaultValue()
            }

            return defaultValue
        }
    }
    
    
    
}
export function provide(name, val) {
    const currentInstance: any = getCurrentInstance()

    if(currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent.provides
        if(provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[name] = val
    }
}