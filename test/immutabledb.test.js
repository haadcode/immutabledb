
'use strict'

const assert = require('assert')

// All the storage backends to test
const redis = require('./backends/redis')
const leveldb = require('./backends/leveldb')
const mongodb = require('./backends/mongodb')
const ipfs = require('./backends/ipfs')
const memory = require('./backends/memory')
const fs = require('./backends/file-system')
const ipld = require('./backends/ipld')
const tendermint = require('./backends/tendermint')

const databases = [memory, ipld, ipfs, fs, leveldb, mongodb, redis, tendermint]

// Test data
const fixtures = require('./fixtures')
const testData = fixtures.testData

// State
let db

describe.only('ImmutableDB', function () {
  this.timeout(10000)

  databases.forEach(backend => {

    // Allow backends to return a different result hash
    const expectedHash = backend.expectedHash || fixtures.expectedHash

    // Allow backends to return a custom error message
    const notFoundError = backend.notFoundError || 'not found'

    // Test each backend against these tests
    describe(backend.name, () => {
      before(async () => {
        db = await backend.setup()
      })

      after(async () => {
        await backend.teardown()
      })

      it('put', async () => {
        const hash = await db.put(testData)
        assert.equal(hash, expectedHash)
      })

      it('get', async () => {
        const data = await db.get(expectedHash)
        assert.equal(data, testData)
      })

      it('get throws an error', async () => {
        let err
        try {
          await db.get('123')
        } catch (e) {
          err = e
        }
        assert.equal(err.toString().toLowerCase().indexOf(notFoundError) > -1, true)
      })
    })

  })
})
