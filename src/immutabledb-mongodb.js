'use strict'

const promisify = require('promisify-es6')
const ImmutableDB = require('./immutabledb-interface')
const createMultihash = require('./create-multihash')

/* ImmutableDB using MongoDB */
class MongoDBStore extends ImmutableDB {
  constructor (mongodb) {
    super()
    this._collection = mongodb.collection('immutabledb-mongodb-storage')
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    await promisify(this._collection.insertOne.bind(this._collection))({ _id: hash, value: data })
    return hash
  }

  async get (key) {
    const data = await promisify(this._collection.findOne.bind(this._collection))({ _id: key })
    if (data) {
      const value = JSON.parse(data.value.toString())
      return value
    }
    return null
  }
}

module.exports = MongoDBStore
