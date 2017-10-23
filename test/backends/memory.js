'use strict'

const ImmutableDB = require('../../src/immutabledb')
const MemStore = require('../../src/immutabledb-mem')

module.exports = {
  name: 'Memory',
  setup: () => {
    const store = new MemStore()
    return new ImmutableDB(store)
  },
  teardown: () => {}
}
