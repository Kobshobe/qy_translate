// import { isArray, isObject, isString } from '@vue/shared'

// export {
//   isArray,
//   isFunction,
//   isObject,
//   isString,
//   isDate,
//   isPromise,
//   isSymbol,
// } from '@vue/shared'
// export { isVNode } from 'vue'

// export const isUndefined = (val: any): val is undefined => val === undefined
// export const isBoolean = (val: any): val is boolean => typeof val === 'boolean'
// export const isNumber = (val: any): val is number => typeof val === 'number'

// export const isEmpty = (val: unknown) =>
//   (!val && val !== 0) ||
//   (isArray(val) && val.length === 0) ||
//   (isObject(val) && !Object.keys(val).length)

// export const isElement = (e: unknown): e is Element => {
//   if (typeof Element === 'undefined') return false
//   return e instanceof Element
// }

// export const isStringNumber = (val: string): boolean => {
//   if (!isString(val)) {
//     return false
//   }
//   return !Number.isNaN(Number(val))
// }

export const isUndefinedOrNull = (val:any) :boolean => {
  if (val === null || val === undefined) {
    return true
  } else {
    return false
  }
}

export function findIndex(array: any[], value: any) {
  return array.findIndex(item => item === value)
}