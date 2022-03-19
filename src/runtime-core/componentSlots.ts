import { isArray, ShapeFlags } from "../shared"

export function initSlots(install, children) {
   const { shapeFlag } = install.vnode
   // element类型children为slots
   if(shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
      normalizeObjectSlots(children, install.slots)
   }
}

function normalizeObjectSlots(rowSlots, slots) {
    // 遍历slots对象
    for(const key in rowSlots) {
        let value = rowSlots[key]
        // valie的返回值就是插入的slots vNode类型
        // 存在slots里 给子组建使用
        slots[key] = (props)=> normalizeSlotsValie(value(props))
    }
}

function normalizeSlotsValie(value) {
    return isArray(value) ? value : [value]
}