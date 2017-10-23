'use strict'

const ImmutableDB = require('./immutabledb-interface')

const defaultEncoding = { enc: 'base58' }

/* ImmutableDB using IPFS */
class IPFSStore extends ImmutableDB {
  constructor (ipfs) {
    super()
    this._ipfs = ipfs
  }

  async put (value) {
    const data = Buffer.isBuffer(value) ? value : new Buffer(JSON.stringify(value))
    const dag = await this._ipfs.object.put(data)
    return dag.toJSON().multihash
  }

  async get (key) {
    const dag = await this._ipfs.object.get(key, defaultEncoding)
    if (dag) {
      const value = JSON.parse(dag.toJSON().data)
      return value
    }
    return null
  }
}

module.exports = IPFSStore
