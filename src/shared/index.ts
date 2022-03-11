export * from './shapeFlags'
export const extend = Object.assign
export function isObject(val)  {
    return val !== null && typeof val === 'object'
}
export function isString(val) {
    return typeof val === 'string'
}

export function isArray(val) {
    return Array.isArray(val)
}
export const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
};