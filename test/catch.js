const { assert } = require('chai')
const _Promise = require('../promise.js').default

describe('Promise.prototype.catch', () => {
  it('Throw an error', (done) => {
    new _Promise(() => {
      throw new Error('test')
    }).catch((e) => {
      assert.instanceOf(e, Error)
      assert(e.message === 'test')
      done()
    })
  })

  it('Rejected promise', (done) => {
    new _Promise((resolve, reject) => {
      reject(new Error('test'))
    }).catch((e) => {
      assert.instanceOf(e, Error)
      assert(e.message === 'test')
      done()
    })
  })

  it('Resolved promise', () => {
    new _Promise((resolve) => {
      resolve('ok')
      throw new Error('test')
    }).catch((e) => {
    }).then((value) => {
      assert(value === 'ok')
      done()
    })
  })
})
