'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const rmrf = require('rimraf')
const { spawn } = require('child_process')
const MongoClient = require('mongodb').MongoClient
const ImmutableDB = require('../../src/immutabledb')
const MondoDBStore = require('../../src/immutabledb-mongodb')

const mongodbBinPath = './deps/mongodb/bin'
const mongodbPort = 27017
const url = `mongodb://0.0.0.0:${mongodbPort}/immutabledb-mongodb-test`
const testRepoPath = path.join(os.tmpdir(), new Date().getTime().toString(), '/test/mongodb-test-data')

let mongodb, serverProcess

module.exports = {
  name: 'MongoDB',
  setup: () => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(testRepoPath))
        rmrf.sync(testRepoPath)

      mkdirp.sync(testRepoPath)

      serverProcess = spawn(path.join(mongodbBinPath, 'mongod'), [`--dbpath=${testRepoPath}`, `--port=${mongodbPort}`])

      setTimeout(() => {
        MongoClient.connect(url, (err, client) => {
          if (err) 
            return reject(err)

          mongodb = client
          const store = new MondoDBStore(mongodb)
          const db = new ImmutableDB(store)
          resolve(db)
        })
      }, 5000)
    })
  },
  teardown: () => {
    if (mongodb) mongodb.close()
    if (serverProcess) serverProcess.kill()
    rmrf.sync(testRepoPath)
  }
}
