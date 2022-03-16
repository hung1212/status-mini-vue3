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

export const hasOwn = (obj, key)=> {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : "";
    });
};

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : "";
};