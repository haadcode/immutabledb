'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const IPFS = require('ipfs')
const ImmutableDB = require('../../src/immutabledb')
const IPLDStore = require('../../src/immutabledb-ipld')

const testRepoPath = path.join(os.tmpdir(), new Date().getTime().toString(), '/test/ipfs-test-repo')

let ipfs

module.exports = {
  name: 'IPLD',
  expectedHash: 'zdpuAyGZJaZ86RGcwwqaRQRy4aLuZMUk4u4RrNQCGwiQpYSRV',
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
        const store = new IPLDStore(ipfs)
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
