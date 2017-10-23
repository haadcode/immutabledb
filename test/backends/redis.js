'use strict'

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const redis = require('redis')
const bluebird = require('bluebird')
const ImmutableDB = require('../../src/immutabledb')
const RedisStore = require('../../src/immutabledb-redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const redisBinPath = './deps/redis-stable/src'

let client, serverProcess

module.exports = {
  name: 'Redis',
  setup: () => {
    return new Promise((resolve, reject) => {
      serverProcess = spawn(path.join(redisBinPath, 'redis-server'))
      setTimeout(() => {
        client = redis.createClient()
        const store = new RedisStore(client)
        const db = new ImmutableDB(store)
        resolve(db)
      }, 1000)
    })
  },
  teardown: () => {
    return new Promise((resolve, reject) => {
      if (client) client.quit()
      if (serverProcess) serverProcess.kill()
      setTimeout(() => {
        // Remove redis' disk cache after the process has been killed
        const redisDumpfilePath = path.join(process.cwd(), './dump.rdb')
        if (fs.existsSync(redisDumpfilePath)) {
          fs.unlinkSync(redisDumpfilePath)
        }

        resolve()
      }, 1000)
    })
  }
}
