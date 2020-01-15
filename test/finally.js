const { assert } = require('chai')
const _Promise = require('../promise.js').default

describe('Promise.prototype.finally', () => {
  it('Rejected promise', (done) => {
    _Promise.resolve(2).finally(() => {}).then((value) => {
      assert(value === 2)
      done()
    })
  })

  it('Resolved promise', () => {
    _Promise.reject(3).finally(() => {}).catch((reason) => {
      assert(reason === 3)
      done()
    })
  })
})
