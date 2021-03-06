'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const IPFS = require('ipfs')
const ImmutableDB = require('../src/immutabledb-ipld')

const testRepoPath = path.join(process.cwd(), './benchmark/ipfs-benchmark-data')

// State
let db, ipfs

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0

const queryLoop = async () => {
  const obj = {
    value: 'hello world',
    count: totalQueries,
  }
  db.put(obj)
    .then(async (res) => {
      totalQueries++
      lastTenSeconds++
      queriesPerSecond++
      setImmediate(queryLoop)
    })
    .catch((e) => console.error(e))
}

process.on('SIGINT', () => {
  console.log('\nCleaning up...')
  rmrf.sync(testRepoPath)
  process.exit(0)
})

const run = (() => {
  if (fs.existsSync(testRepoPath))
    rmrf.sync(testRepoPath)

  console.log('Starting benchmark...')

  ipfs = new IPFS({
    repo: testRepoPath,
    start: false, // don't go online
  })

  ipfs.on('error', (err) => {
    console.error(err)
  })

  ipfs.on('ready', () => {
    db = new ImmutableDB(ipfs)

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
  })
})()

module.exports = run
