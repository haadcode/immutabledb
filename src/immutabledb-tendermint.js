'use strict'

const ImmutableDB = require('./immutabledb-interface')
const createMultihash = require('./create-multihash')
const request = require('axios')
const abci = require('js-abci')

function CounterApp(){
  this._state = {}
}

CounterApp.prototype.info = (req, cb) => {
  return cb('no info')
}

CounterApp.prototype.setOption = (req, cb) => {
  return cb({ log: 'not supported' })
}

CounterApp.prototype.deliverTx = function (req, cb) {
  const tx = req.deliver_tx.tx.toBuffer().toString()
  const [key, value] = tx.split('&').map(e => e.split('=')[1])
  this._state[key] = value
  return cb({ code: abci.CodeType_OK })
}

CounterApp.prototype.checkTx = function(req, cb) {
  return cb({ code:abci.CodeType_OK })
}

CounterApp.prototype.commit = async function(req, cb) {
  const data = new Buffer(JSON.stringify(this._state))
  const hash = await createMultihash(data)
  return cb({ data: hash })
}

CounterApp.prototype.query = function(req, cb) {
  const key = req.query.data.toBuffer().toString()
  const value = this._state[key]

  if (!value)
    return cb({ log: 'not found' })

  return cb({ code: abci.CodeType_OK, value: Buffer.from(value), log: "hello" })
}

/* ImmutableDB using Tendermint */
class TendermintStore extends ImmutableDB {
  constructor () {
    super()
    const app = new CounterApp();
    const appServer = new abci.Server(app)
    appServer.server.listen(46658)
  }

  async put (value) {
    const data = new Buffer(JSON.stringify(value))
    const hash = await createMultihash(data)
    try {
      await request.get('http://0.0.0.0:46657/broadcast_tx_commit?tx=0x' + Buffer.from(`key=${hash}&value=${data}`).toString('hex'))
    } catch (resError) {
      console.log("ERROR:", resError)
      throw resError
    }
    return hash
  }

  async get (key) {
    try {
      let query = await request.get('http://0.0.0.0:46657/abci_query?data=0x' + Buffer.from(key).toString('hex') + '&path=&prove=false')
      const result = query.data.result.response.value && query.data.result.response.value !== ''
        ? Buffer.from(query.data.result.response.value, 'hex').toString()
        : null
      if (result) {
        const value = JSON.parse(result)
        return value
      }
      return null
    } catch (resError) {
      console.log("ERROR:", resError)
      throw resError
    }
  }
}

module.exports = TendermintStore
