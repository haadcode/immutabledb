'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const { spawn } = require('child_process')
const MongoClient = require('mongodb').MongoClient
const ImmutableDB = require('../src/immutabledb-mongodb')

const mongodbBinPath = './deps/mongodb/bin'
const mongodbPort = 21000
const url = `mongodb://0.0.0.0:${mongodbPort}/immutabledb-mongodb-test`
const testRepoPath = path.join(process.cwd(), './benchmark/mongodb-benchmark-data')

// State
let db, mongoProcess

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0

process.on('SIGINT', () => {
  console.log('\nCleaning up...')
  mongoProcess.kill()
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
  if (fs.existsSync(testRepoPath))
    rmrf.sync(testRepoPath)

  fs.mkdirSync(testRepoPath)

  console.log('Starting MongoDB...')
  mongoProcess = spawn(path.join(mongodbBinPath, 'mongod'), [`--dbpath=${testRepoPath}`, `--port=${mongodbPort}`])

  setTimeout(() => {
    MongoClient.connect(url, (err, client) => {
      if (err) {
        console.log(err)
        process.exit(1)
      }

      console.log('Starting benchmark...')

      db = new ImmutableDB(client)

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
  }, 2000)
})()

module.exports = run
