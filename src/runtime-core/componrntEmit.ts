import { camelize, toHandlerKey } from "../shared";

export function emit(instance, event, ...args) {
    // const { props } = instance
    // console.log(props)
    // console.log(event)
    // console.log(...args)
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}