'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const { spawn, execSync } = require('child_process')
const ImmutableDB = require('../src/immutabledb')
const TendermintStore = require('../src/immutabledb-tendermint')

const tendermintBinPath = path.resolve('./deps/tendermint')
const testRepoPath = path.join(process.cwd(), './tendermint-benchmark-data')

let tendermint, tendermintProcess

// State
let db

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0

process.on('SIGINT', () => {
  console.log('\nCleaning up...')
  rmrf.sync(testRepoPath)
  process.exit(0)
})

const queryLoop = () => {
  db.put('hello world ' + totalQueries)
    .then((res) => {
      totalQueries++
      lastTenSeconds++
      queriesPerSecond++
      setImmediate(queryLoop)
    })
    .catch((e) => console.error(e))
}

const run = (() => {
  let started = false

  if (fs.existsSync(testRepoPath))
    rmrf.sync(testRepoPath)

  fs.mkdirSync(testRepoPath)

  console.log('Starting Tendermint...')

  execSync(`"${path.join(tendermintBinPath, 'tendermint')}" init --home ${testRepoPath}`)
  tendermintProcess = spawn(path.join(tendermintBinPath, 'tendermint'), [`node`, `--home`, `${testRepoPath}`])

  const store = new TendermintStore()
  db = new ImmutableDB(store)

  tendermintProcess.stdout.on('data', (data) => {
    // Wait for Tendermint to start processing the blocks
    if (!started && data.indexOf('Executed block') > -1) {
      console.log('Starting benchmark...')

      started = true
      // Output metrics at 1 second interval
      setInterval(() => {
        seconds++
        if (seconds % 10 === 0) {
          console.log(`--> Average of ${lastTenSeconds / 10} q/s in the last 10 seconds`)
          if (lastTenSeconds === 0) throw new Error('Problems!')
          lastTenSeconds = 0
        }
        console.log(`${queriesPerSecond} queries per second, ${totalQueries} queries in ${seconds} seconds`)
        queriesPerSecond = 0
      }, 1000)

      setImmediate(queryLoop)
    }
  })
})()

module.exports = run
