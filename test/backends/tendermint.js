'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const rmrf = require('rimraf')
const { spawn, execSync } = require('child_process')
const ImmutableDB = require('../../src/immutabledb')
const TendermintStore = require('../../src/immutabledb-tendermint')

const tendermintBinPath = './deps/tendermint'
const testRepoPath = path.join(os.tmpdir(), '/tendermint-test-repo-' + new Date().getTime().toString())

let tendermint, tendermintProcess

module.exports = {
  name: 'Tendermint',
  setup: () => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(testRepoPath))
        rmrf.sync(testRepoPath)

      mkdirp.sync(testRepoPath)

      execSync(`"${path.join(tendermintBinPath, 'tendermint')}" init --home ${testRepoPath}`)
      tendermintProcess = spawn(path.join(tendermintBinPath, 'tendermint'), [`node`, `--home`, `${testRepoPath}`])
      tendermintProcess.stdout.once('data', () => resolve(db)) // only return after Tendermint has started processing blocks
      // const store = new TendermintStore({ port: 11111 })
      const store = new TendermintStore()
      const db = new ImmutableDB(store)
    })
  },
  teardown: () => {
    if (tendermintProcess) tendermintProcess.kill()
    rmrf.sync(testRepoPath)
  }
}
