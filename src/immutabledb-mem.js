'use strict'

const LRU = require('lru')
const ImmutableDB = require('./immutabledb-interface')
const createMultihash = require('./create-multihash')

/* Memory store using an LRU cache */
class MemStore extends ImmutableDB {
  constructor () {
    super()
    this._store = new LRU(1000)
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    this._store.set(hash, data)
    return hash
  }

  async get (key) {
    const data = this._store.get(key)

    if (data) {
      const value = JSON.parse(data)
      return value
    }

    return data
  }
}


module.exports = MemStore
