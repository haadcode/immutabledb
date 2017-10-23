'use strict'

const ImmutableDB = require('./immutabledb-interface')
const path = require('path')
const promisify = require('promisify-es6')
const createMultihash = require('./create-multihash')

/* ImmutableDB using FileSystem */
class FSStore extends ImmutableDB {
  constructor (fs, rootDirectory) {
    super()
    this._fs = fs
    this._rootDirectory = rootDirectory ||  './immutabledb-fs'

    if (!this._fs.existsSync(this._rootDirectory))
      this._fs.mkdirSync(this._rootDirectory)
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    await promisify(this._fs.writeFile)(path.join(this._rootDirectory, hash), data)
    return hash
  }

  async get (key) {
    const data = await promisify(this._fs.readFile)(path.join(this._rootDirectory, key))
    if (data) {
      const value = JSON.parse(data)
      return value
    }
    return null
  }
}

module.exports = FSStore
