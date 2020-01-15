const { assert } = require('chai')
const _Promise = require('../promise.js').default

describe('Promise.all', () => {
  it('Wait for all resolved promises', (done) => {
    const p1 = _Promise.resolve(123)
    const p2 = 666
    const p3 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve(233)
      }, 50)
    })
    _Promise.all([p1, p2, p3]).then((values) => {
      assert.sameOrderedMembers(values, [123, 666, 233])
      done()
    })
  })

  it('Throw TypeError when not passing paramter', (done) => {
    _Promise.all().catch((e) => {
      assert.instanceOf(e, TypeError)
      done()
    })
  })

  it('Resolve synchronously when passing empty iterator', () => {
    const p = _Promise.all([])
    // 此时 p 应该是已经 resolve 了，而不必等到下一个微任务
    // 如果从控制台打印，能直接看到状态是 fulfilled ，但在代码中只能通过 `then` 这类方法获取，这边采用实现内部的 `_status` 来判断 promise 的状态
    assert(p._status === 'fulfilled')
  })

  it('Resolve asynchronously', (done) => {
    const p = _Promise.all([1, 2, 3])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'fulfilled')
      p.then((values) => {
        assert.sameOrderedMembers(values, [1, 2, 3])
        done()
      })
    }, 0)
  })

  it('Reject asynchronously', (done) => {
    const p = _Promise.all([_Promise.resolve(1), _Promise.reject(2)])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'rejected')
      p.catch((reason) => {
        assert(reason === 2)
        done()
      })
    }, 0)
  })

  it('Reject immediately', (done) => {
    const p1 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p1')
      }, 50)
    })
    const p2 = new _Promise((resolve, reject) => {
      reject('p2')
    })
    _Promise.all([p1, p2]).catch((reason) => {
      assert(reason === 'p2')
      done()
    })
  })
})
