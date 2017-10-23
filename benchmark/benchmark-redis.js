'use strict'

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const ImmutableDB = require('../src/immutabledb-redis')
const rmrf = require('rimraf')
const Metrics = require('./metrics.js')

const redisBinPath = './deps/redis-stable/src'

// State
let db, client, serverProcess, interval
let killed = false

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0

process.on('SIGINT', () => {
  killed = true
  console.log('\nCleaning up...')
  clearInterval(interval)
  client.quit()
  serverProcess.kill()
  setTimeout(() => {
    // Remove redis' disk cache after the process has been killed
    fs.unlinkSync(path.join(process.cwd(), './dump.rdb'))
    process.exit(0)
  }, 1000)
})

const queryLoop = () => {
  db.put('hello world ' + totalQueries)
    .then((res) => {
      totalQueries++
      lastTenSeconds++
      queriesPerSecond++
      if (!killed)
        setImmediate(queryLoop)
    })
    .catch((e) => console.error(e))
}

const run = (() => {
  console.log('Starting redis-server...')
  serverProcess = spawn(path.join(redisBinPath, 'redis-server'))

  setTimeout(() => {
    console.log('Starting benchmark...')

    client = redis.createClient()
    db = new ImmutableDB(client)

    const metrics = new Metrics()
    metrics.start()

    // Output metrics at 1 second interval
    interval = setInterval(() => {
      seconds++
      if (seconds % 10 === 0) {
        metrics.measure('writes_per_second', lastTenSeconds / 10, 'benchmark-redis-' + new Date().getTime())
        console.log(`--> Average of ${lastTenSeconds / 10} q/s in the last 10 seconds`)
        if (lastTenSeconds === 0) throw new Error('Problems!')
        lastTenSeconds = 0
      }
      console.log(`${queriesPerSecond} queries per second, ${totalQueries} queries in ${seconds} seconds`)
      queriesPerSecond = 0
    }, 1000)

    setImmediate(queryLoop)
  }, 1000)
})()

module.exports = run
