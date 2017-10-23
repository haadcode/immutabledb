'use strict'

const ImmutableDB = require('./immutabledb-interface')

const defaultFormat = { format: 'dag-cbor', hashAlg: 'sha2-256' }

/* ImmutableDB using IPLD (through IPFS) */
class IPLDStore extends ImmutableDB {
  constructor (ipfs) {
    super()
    this._ipfs = ipfs
  }

  async put (value) {
    const cid = await this._ipfs.dag.put(value, defaultFormat)
    return cid.toBaseEncodedString()
  }

  async get (key) {
    const result = await this._ipfs.dag.get(key)
    return result.value
  }
}

module.exports = IPLDStore
