'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const levelup = require('levelup')
const levelPromised = require('level-promisify')
const ImmutableDB = require('../../src/immutabledb')
const LevelDBStore = require('../../src/immutabledb-leveldb')

const testRepoPath = path.join(os.tmpdir(), '/leveldb-test-repo-' + new Date().getTime().toString())

module.exports = {
  name: 'LevelDB',
  setup: () => {
    if (fs.existsSync(testRepoPath))
      rmrf.sync(testRepoPath)

    const leveldb = levelPromised(levelup(testRepoPath))
    const store = new LevelDBStore(leveldb)
    return new ImmutableDB(store)
  },
  teardown: () => {
    rmrf.sync(testRepoPath)
  }
}
