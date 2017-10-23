'use strict'

const MemStore = require('./immutabledb-mem')

/* ImmutableDB */
class ImmutableDB {
  constructor (store) {
    this._store = store || new MemStore()
  }

  async put (value) {
    const hash = await this._store.put(value)
    return hash
  }

  async get (hash) {
    const result = await this._store.get(hash)

    if (result === null || result === undefined)
      throw new Error('Not found')

    return result
  }
}

module.exports = ImmutableDB
