/**
 * promises-aplus-tests adapters
 */

import _Promise from './promise'

const resolved = (value) => {
  return _Promise.resolve(value)
}

const rejected = (reason) => {
  return _Promise.reject(reason)
}

const deferred = () => {
  let resolve
  let reject
  const promise = new _Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return {
    promise,
    resolve,
    reject,
  }
}

export {
  resolved,
  rejected,
  deferred,
}
