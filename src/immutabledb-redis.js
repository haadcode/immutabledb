'use strict'

const ImmutableDB = require('./immutabledb-interface')
const createMultihash = require('./create-multihash')

/* ImmutableDB using Redis */
class RedisStore extends ImmutableDB {
  constructor (redis) {
    super()
    this._redis = redis
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    await this._redis.setAsync.bind(this._redis)(hash, data)
    return hash
  }

  async get (key) {
    const data = await this._redis.getAsync.bind(this._redis)(key)
    if (data) {
      const value = JSON.parse(data)
      return value
    }
    return null
  }
}

module.exports = RedisStore
