import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { isReactive, reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerRefValue(this);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function triggerRefValue(ref) {
    triggerEffects(ref.dep)
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
  return !!(ref && ref.__v_isRef)
}

export function unRef(value) {
  return isRef(value) ? value.value : value
}

const shallowUnwrapHandlers: any = {
  get(obj, key) {
    return unRef(obj[key])
  },
  set(obj, key, value) {
    let oldValue = obj[key]
    if(isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }
    return Reflect.set(obj, key, value)
  }
}

export function proxyRefs(obj) {
  return isReactive(obj) ? obj : new Proxy(obj, shallowUnwrapHandlers)
}

class ObjectRefImpl {
  public __v_isRef = true
  private obj
  private key
  constructor(obj, key) {
    this.obj = obj
    this.key = key
  }
  get value() {
    return Reflect.get(this.obj, this.key)
  }
  set value(val) {
    Reflect.set(this.obj, this.key, val)
  }
}

export function toRef(obj, key) {
  return new ObjectRefImpl(obj, key)
}

export function toRefs(obj) {
  let res: any = {}
  for (const key in obj) {
    res[key] = toRef(obj, key)
  }

  return res
}

