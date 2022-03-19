const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots:(i)=> i.slots
};

import { hasOwn } from "../shared"

export const PublicInstanceProxyHandlers = {
    get({_:instance}, key) {
        const { setupState, props } = instance
        if(hasOwn(setupState, key)) {
            return setupState[key]
        } else if(hasOwn(props, key)) {
            return props[key]
        }

        // 代理组件Api
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
          return publicGetter(instance);
        }
    } 
}