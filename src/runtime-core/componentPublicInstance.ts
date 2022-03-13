// const publicPropertiesMap = {
//     $el: (i) => i.vnode.el,
// };

import { hasOwn } from "../shared"

export const PublicInstanceProxyHandlers = {
    get({_:instance}, key) {
        const { setupState, props } = instance
        if(hasOwn(setupState, key)) {
            return setupState[key]
        } else if(hasOwn(props, key)) {
            return props[key]
        }

        // 以下代码目前用到 先注释
        // const publicGetter = publicPropertiesMap[key];
        // if (publicGetter) {
        //   return publicGetter(instance);
        // }
    } 
}