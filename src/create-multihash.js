'use strict'

const multihashing = require('multihashing-async')
const mh = require('multihashes')

const defaultHashAlg = 'sha2-256'

const createMultihash = (data, hashAlg) => {
  return new Promise((resolve, reject) => {
    multihashing(data, hashAlg || defaultHashAlg, (err, multihash) => {
      if (err)
        return reject(err)

      resolve(mh.toB58String(multihash))
    })
  })
}

module.exports = createMultihash
