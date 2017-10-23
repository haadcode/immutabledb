'use strict'

const ImmutableDB = require('./immutabledb-interface')
const promisify = require('promisify-es6')
const createMultihash = require('./create-multihash')

/* ImmutableDB using LevelDB */
class LevelDBStore extends ImmutableDB {
  constructor (leveldb) {
    super()
    this._leveldb = leveldb
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    await promisify(this._leveldb.put.bind(this._leveldb))(hash, data)
    return hash
  }

  async get (key) {
    const data = await promisify(this._leveldb.get.bind(this._leveldb))(key)
    if (data) {
      const value = JSON.parse(data)
      return value
    }
    return null
  }
}

module.exports = LevelDBStore
