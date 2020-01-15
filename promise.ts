/**
 * Promises/A+ 规范实现
 * https://promisesaplus.com/
 */

interface PromiseFulfilledResult<T> {
  status: 'fulfilled',
  value: T,
}

interface PromiseRejectedResult {
  status: 'rejected',
  reason: any,
}

type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult

// 2.1 三种状态
enum PROMISE_STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

// 2.3
const promiseResolutionProcedure = <T> (promise: _Promise<T>, x, resolve, reject) => {
  // 2.3.1 如果 `promise` 与 `x` 是同一个对象，则以一个 `TypeError` 拒绝这个 `promise`
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 2.3.2 如果 `x` 是一个 Promise ，则 `promise` 需等待到 `x` 状态改变后，以 `x` 对应的状态与 `value` 或 `reason` 去 resolve 或 reject
  if (x instanceof _Promise) {
    x.then((value) => {
      resolve(value)
    }, (reason) => {
      reject(reason)
    })
  } else if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3 如果 `x` 是一个对象或函数
    try {
      // 2.3.3.1 令 `then` = `x.then`
      const then = x.then
      if (typeof then === 'function') {
        // 2.3.3.3 如果 `then` 是一个函数，则以 `x` 为 `this` 调用这个函数，第一个参数为 `resolvePromise` ，第二个参数为 `rejectPromise`
        let called = false
        const resolvePromise = (y) => {
          // 2.3.3.3.3 当 `resolvePromise` 与 `rejectPromise` 都被调用了，或者同一个函数被调用多次，只处理第一次，后续的调用都忽略
          if (called) return
          called = true
          // 2.3.3.3.1 当第一个参数以 `y` 作为值被调用，则运行 `the Promise Resolution Procedure`[[Resolve]](promise, y)
          promiseResolutionProcedure(promise, y, resolve, reject)
        }
        const rejectPromise = (r) => {
          // 2.3.3.3.3 当 `resolvePromise` 与 `rejectPromise` 都被调用了，或者同一个函数被调用多次，只处理第一次，后续的调用都忽略
          if (called) return
          called = true
          // 2.3.3.3.2 当第二个参数以 `r` 作为值被调用，则以 `r` 将 `promise` 的状态改变为 `rejected`
          reject(r)
        }
        try {
          then.call(x, resolvePromise, rejectPromise)
        } catch (e) {
          // 2.3.3.3.4 如果调用 `then` 时抛出异常 `e`
          // 2.3.3.3.4.1 如果 `resolvePromise` 或 `rejectPromise` 被调用过，则忽略
          // 2.3.3.3.4.2 否则以 `e` 将 `promise` 的状态改为 `rejected`
          if (!called) {
            reject(e)
          }
        }
      } else {
        // 2.3.3.4 如果 `then` 不是一个函数，则以 `x` 为值，将 `promise` 状态改变为 `fulfilled`
        resolve(x)
      }
    } catch (e) {
      // 2.3.3.2 如果获取 `x.then` 的值抛出一个异常 `e` ，则以这个异常 `e` reject `promise`
      reject(e)
    }
  } else {
    // 2.3.4 如果 `x` 不是对象或函数，则以 `x` 为值，将 `promise` 状态改变为 `fulfilled`
    resolve(x)
  }
}

export default class _Promise<T = unknown> {
  private _status: PROMISE_STATUS = PROMISE_STATUS.PENDING

  private _value: T

  private _reason: any

  private _fulfillQueue = []

  private _rejectQueue = []

  private _isPendingResolveValue = false

  constructor (executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    const resolve = (value?: T | PromiseLike<T>) => {
      if (this._status === PROMISE_STATUS.PENDING) {
        // 多次调用 resolve ，忽略后面的调用
        if (this._isPendingResolveValue) return
        this._isPendingResolveValue = true
        const _resolve = (lastValue: T) => {
          this._status = PROMISE_STATUS.FULFILLED
          this._value = lastValue
          // 2.2.6.1
          this._fulfillQueue.forEach((fulfillCallback) => {
            // 2.2.4 在微任务中排队
            queueMicrotask(fulfillCallback)
          })
        }
        // 如果 value 是一个 thenable ，获取最终 resolve 的 value 赋值
        promiseResolutionProcedure(this, value, _resolve, reject)
      }
    }
    const reject = (reason?: any) => {
      if (this._status === PROMISE_STATUS.PENDING) {
        this._status = PROMISE_STATUS.REJECTED
        this._reason = reason
        // 2.2.6.2
        this._rejectQueue.forEach((rejectCallback) => {
          // 2.2.4 在微任务中排队
          queueMicrotask(rejectCallback)
        })
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      // 执行 executor 遇到抛出异常的话，直接 reject ，虽然浏览器可能会把没有 catch 的异常也抛出，但没有抛出也是符合规范的
      reject(e)
    }
  }

  // 2.2.1 `onFulfilled` 与 `onRejected` 都是可选参数，如果 `onFulfilled` 和 `onRejected` 不是函数，则忽略
  then <TResult1 = T, TResult2 = never> (onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): _Promise<TResult1 | TResult2> {
    const promise2 = new _Promise<TResult1 | TResult2>((resolve, reject) => {
      // 将执行 onFulfilled 的过程抽离
      const executeOnFulfilled = () => {
        if (typeof onFulfilled === 'function') {
          try {
            // 2.2.2 如果 `onFulfilled` 是一个函数，在 promise 状态为 `fulfilled` 之后，以 promise 的 `value` 值传入调用
            // 2.2.5 `onFulfilled` 应作为一个函数调用，没有 `this` 值
            // 2.2.7.1 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x` ，则执行 `the Promise Resolution Procedure` [[Resolve]](promise2, x)
            const x = onFulfilled(this._value as T)
            resolve(x)
          } catch (e) {
            // 2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出异常，则 promise2 以此异常拒绝（reject）
            reject(e)
          }
        } else {
          // 2.2.7.3 如果 promise 状态为 `fulfilled` ，但 `onFulfilled` 不是一个函数，则 promise2 状态以 promise 的 `value` 值改变为 `fulfilled`
          resolve(this._value as unknown as TResult1)
        }
      }
      // 将执行 onRejected 的过程抽离
      const executeOnRejected = () => {
        if (typeof onRejected === 'function') {
          try {
            // 2.2.3 如果 `onRejected` 是一个函数，在 promise 状态为 `rejected` 之后，以 promise 的 `reason` 值传入调用
            // 2.2.5 `onRejected` 应作为一个函数调用，没有 `this` 值
            // 2.2.7.1 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x` ，则执行 `the Promise Resolution Procedure` [[Resolve]](promise2, x)
            const x = onRejected(this._reason)
            resolve(x)
          } catch (e) {
            // 2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出异常，则 promise2 以此异常拒绝（reject）
            reject(e)
          }
        } else {
          // 2.2.7.4 如果 promise 状态为 `rejected` ，但 `onRejected` 不是一个函数，则 promise2 状态以 promise 的 `reason` 值改变为 `rejected`
          reject(this._reason)
        }
      }
      if (this._status === PROMISE_STATUS.PENDING) {
        // 2.2.6.1 `then` 方法可能在同一个 promise 上被调用多次，当 promise 状态变成 `fulfilled` 时，所有 `onFulfilled` 回调按 `then` 的调用顺序调用
        this._fulfillQueue.push(executeOnFulfilled)
        // 2.2.6.2 `then` 方法可能在同一个 promise 上被调用多次，当 promise 状态变成 `rejected` 时，所有 `onRejected` 回调按 `then` 的调用顺序调用
        this._rejectQueue.push(executeOnRejected)
      } else if (this._status === PROMISE_STATUS.FULFILLED) {
        // 2.2.4
        queueMicrotask(executeOnFulfilled)
      } else if (this._status === PROMISE_STATUS.REJECTED) {
        // 2.2.4
        queueMicrotask(executeOnRejected)
      }
    })
    // 2.2.7 `then` 必须返回一个 promise
    return promise2
  }

  catch <TResult = never> (onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): _Promise<T | TResult> {
    return this.then(undefined, onRejected)
  }

  // es2018
  finally (onFinally?: (() => void) | undefined | null): _Promise<T> {
    return this.then((value) => {
      onFinally()
      return value
    }, (reason) => {
      onFinally()
      throw reason
    })
  }

  // es2015
  static all <T> (values: readonly (T | PromiseLike<T>)[]): _Promise<T[]> {
    let array: Array<T | PromiseLike<T>> = []
    try {
      array = Array.from(values)
    } catch (e) {
      return _Promise.reject(e)
    }
    const length = array.length
    if (!length) return _Promise.resolve([])
    const result: T[] = []
    let resultLength = 0
    return new _Promise((resolve, reject) => {
      array.forEach((p, i) => {
        new _Promise<T>((resolve) => {
          resolve(p)
        }).then((value) => {
          result[i] = value
          resultLength++
          if (resultLength === length) {
            resolve(result)
          }
        }, (reason) => {
          reject(reason)
        })
      })
    })
  }

  // es2015
  static race <T> (values: Iterable<T>): _Promise<T extends PromiseLike<infer U> ? U : T> {
    let array: Array<(T extends PromiseLike<infer U> ? U : T) | PromiseLike<T extends PromiseLike<infer U> ? U : T>> = []
    try {
      array = Array.from(values) as Array<(T extends PromiseLike<infer U> ? U : T) | PromiseLike<T extends PromiseLike<infer U> ? U : T>>
    } catch (e) {
      return _Promise.reject(e)
    }
    return new _Promise((resolve, reject) => {
      array.forEach((p) => {
        new _Promise<T extends PromiseLike<infer U> ? U : T>((resolve) => {
          resolve(p)
        }).then((value) => {
          resolve(value)
        }, (reason) => {
          reject(reason)
        })
      })
    })
  }

  // es2015
  static resolve <T> (value?: T | PromiseLike<T>): _Promise<T> {
    if (value instanceof _Promise) return value
    return new _Promise<T>((resolve) => {
      resolve(value)
    })
  }

  // es2015
  static reject <T = never> (reason?: any): _Promise<T> {
    return new _Promise((resolve, reject) => {
      reject(reason)
    })
  }

  // es2020
  static allSettled <T> (values: Iterable<T>): _Promise<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]> {
    let array: Array<(T extends PromiseLike<infer U> ? U : T) | PromiseLike<T extends PromiseLike<infer U> ? U : T>> = []
    try {
      array = Array.from(values) as Array<(T extends PromiseLike<infer U> ? U : T) | PromiseLike<T extends PromiseLike<infer U> ? U : T>>
    } catch (e) {
      return _Promise.reject(e)
    }
    const length = array.length
    if (!length) return _Promise.resolve([])
    const result: Array<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>> = []
    let resultLength = 0
    return new _Promise((resolve) => {
      const checkResolve = () => {
        resultLength++
        if (resultLength === length) {
          resolve(result)
        }
      }
      array.forEach((p, i) => {
        new _Promise<T extends PromiseLike<infer U> ? U : T>((resolve) => {
          resolve(p)
        }).then((value) => {
          result[i] = {
            status: PROMISE_STATUS.FULFILLED,
            value,
          }
          checkResolve()
        }, (reason) => {
          result[i] = {
            status: PROMISE_STATUS.REJECTED,
            reason,
          }
          checkResolve()
        })
      })
    })
  }
}
