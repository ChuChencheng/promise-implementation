const { assert } = require('chai')
const _Promise = require('../promise.js').default

describe('Promise.allSettled', () => {
  it('Wait for all promises', (done) => {
    const p1 = _Promise.resolve(123)
    const p2 = 666
    const p3 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve(233)
      }, 30)
    })
    const p4 = new _Promise((resolve, reject) => {
      setTimeout(() => {
        reject('p4')
      }, 20)
    })
    _Promise.allSettled([p1, p2, p3, p4]).then((results) => {
      assert.sameDeepOrderedMembers(results, [
        { status: 'fulfilled', value: 123 },
        { status: 'fulfilled', value: 666 },
        { status: 'fulfilled', value: 233 },
        { status: 'rejected', reason: 'p4' },
      ])
      done()
    })
  })

  it('Throw TypeError when not passing paramter', (done) => {
    _Promise.allSettled().catch((e) => {
      assert.instanceOf(e, TypeError)
      done()
    })
  })

  it('Resolve synchronously when passing empty iterator', () => {
    const p = _Promise.allSettled([])
    assert(p._status === 'fulfilled')
  })

  it('Resolve asynchronously', (done) => {
    const p = _Promise.allSettled([1, 2, 3])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'fulfilled')
      p.then((results) => {
        assert.sameDeepOrderedMembers(results, [
          { status: 'fulfilled', value: 1 },
          { status: 'fulfilled', value: 2 },
          { status: 'fulfilled', value: 3 },
        ])
        done()
      })
    }, 0)
  })
})
