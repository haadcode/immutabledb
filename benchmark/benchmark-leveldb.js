'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const levelup = require('levelup')
const levelPromised = require('level-promisify')
const ImmutableDB = require('../src/immutabledb-leveldb')

const testRepoPath = path.join(process.cwd(), './benchmark/leveldb-benchmark-data')

// State
let db, leveldb

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
  console.log('Starting benchmark...')

  if (fs.existsSync(testRepoPath))
    rmrf.sync(testRepoPath)

  leveldb = levelPromised(levelup(testRepoPath))
  db = new ImmutableDB(leveldb)

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
})()

module.exports = run
