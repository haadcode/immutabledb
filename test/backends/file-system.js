'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const ImmutableDB = require('../../src/immutabledb')
const FSStore = require('../../src/immutabledb-fs')

const testRepoPath = path.join(os.tmpdir(), '/fs-test-repo-' + new Date().getTime().toString())

module.exports = {
  name: 'FileSystem',
  notFoundError: 'no such file or directory',
  setup: () => {
    if (fs.existsSync(testRepoPath))
      rmrf.sync(testRepoPath)

    const store = new FSStore(fs, testRepoPath)
    return new ImmutableDB(store)
  },
  teardown: () => {
    rmrf.sync(testRepoPath)
  }
}
