const { assert } = require('chai')
const _Promise = require('../promise.js').default

describe('Promise.race', () => {
  it('Throw TypeError when not passing paramter', (done) => {
    _Promise.race().catch((e) => {
      assert.instanceOf(e, TypeError)
      done()
    })
  })

  it('Always pending when passing empty iterator', (done) => {
    const p = _Promise.race([])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'pending')
      done()
    }, 0)
  })

  it('Resolve asynchronously', (done) => {
    const p = _Promise.race([1, _Promise.resolve(2), 3])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'fulfilled')
      p.then((value) => {
        assert(value === 1)
        done()
      })
    }, 0)
  })

  it('Reject asynchronously', (done) => {
    const p = _Promise.race([_Promise.reject(1), _Promise.resolve(2)])
    assert(p._status === 'pending')
    setTimeout(() => {
      assert(p._status === 'rejected')
      p.catch((reason) => {
        assert(reason === 1)
        done()
      })
    }, 0)
  })

  it('Resolve once one of the passed promises resolves', (done) => {
    const p1 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p1')
      }, 30)
    })
    const p2 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p2')
      }, 20)
    })
    const p3 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p3')
      }, 10)
    })
    _Promise.race([p1, p2, p3]).then((value) => {
      assert(value === 'p3')
      done()
    })
  })

  it('Reject once one of the passed promises rejects', (done) => {
    const p1 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p1')
      }, 30)
    })
    const p2 = new _Promise((resolve) => {
      setTimeout(() => {
        resolve('p2')
      }, 20)
    })
    const p3 = new _Promise((resolve, reject) => {
      setTimeout(() => {
        reject('p3')
      }, 10)
    })
    _Promise.race([p1, p2, p3]).catch((reason) => {
      assert(reason === 'p3')
      done()
    })
  })
})
