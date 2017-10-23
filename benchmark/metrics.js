const librato = require('librato-node')

class LibratoMetrics {
  constructor() {

  }

  start () {
    librato.configure({
      email: 'samuli@headbanggames.com', 
      token: '3c6c6227813db8a2b324beddc36b1a926dc6a0431eae3c5383afaade0b62a4fc',
      period: 10000,
    })

    librato.start()
     
    process.once('SIGINT', () => {
      librato.stop() // stop optionally takes a callback 
    })
     
    // Don't forget to specify an error handler, otherwise errors will be thrown 
    librato.on('error', (err) => {
      console.error("LIBRATO ERROR:", err)
    })    
  }

  measure (key, value, src) {
    librato.measure(key, value, { source: src })
  }
} 

module.exports = LibratoMetrics
