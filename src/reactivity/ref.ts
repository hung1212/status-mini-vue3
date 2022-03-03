import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

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
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(value) {
  return isRef(value) ? value.value : value
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