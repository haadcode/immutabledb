'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const IPFS = require('ipfs')
const ImmutableDB = require('../../src/immutabledb')
const IPFSStore = require('../../src/immutabledb-ipfs')

const testRepoPath = path.join(os.tmpdir(), new Date().getTime().toString(), '/test/ipfs-test-repo')

let ipfs

module.exports = {
  name: 'IPFS',
  expectedHash: 'QmdhT5MsYjGT5pMj7ik23MiPXnK8mzm813gcabpZwnwY8J',
  notFoundError: 'multihash too short',
  setup: () => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(testRepoPath))
        rmrf.sync(testRepoPath)

      ipfs = new IPFS({
        repo: testRepoPath,
        start: false, // don't go online for tests
      })

      ipfs.on('ready', () => {
        const store = new IPFSStore(ipfs)
        const db = new ImmutableDB(store)
        resolve(db)
      })
    })
  },
  teardown: async () => {
    await ipfs.stop()
    rmrf.sync(testRepoPath)
  }
}
