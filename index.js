'use strict'

const VERBOSE = process.env.VERBOSE == "true"
const MAX_PING_DELTA = process.env.MAX_PING_DELTA
const COMPUTE_ZONE = process.env.COMPUTE_ZONE
const COMPUTE_INSTANCE = process.env.COMPUTE_INSTANCE

const compute = new (require('@google-cloud/compute'))()

console.log(`\x1b[93mWill kill vm on ${MAX_PING_DELTA} seconds inactivity from codemaster\x1b[0m`)

async function stopinstance() {
  const zone = compute.zone(COMPUTE_ZONE)
  const [error, operation, response ] = await zone.vm(COMPUTE_INSTANCE).stop()
  await operation
  console.log("Instance stopped")
}

const fetch = require("node-fetch")
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function loop() {
  while( true )
  {
    await sleep(1000)
    try {
      const pingdelta = Math.floor( .001 * (new Date().getTime() - lastping) )
      if ( VERBOSE )
        console.log( `\x1b[${pingdelta>.9?93:94};1m${pingdelta}\x1b[0;94m seconds since last ping\x1b[0m` )
      if ( pingdelta > MAX_PING_DELTA )
      {
        console.log("That's it! i'm killing the vm...")
        await stopinstance()
        return
      }
    }
    catch( e ) { console.error( e.message ) }
  }
}

loop()



//  //  //  //  //  //  //  //  //  //  //  //



const {readdirSync} = require('fs')
const execSync = require('child_process').execSync

console.clear()

var express = require('express')
var app = express()

const PORT = process.env.PORT || 80

app.use( function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
} )

app.use( '/', express.static('public') )

let lastping = new Date().getTime()
app.get( '/ping/update', (req, res) => res.send( ( lastping = new Date().getTime() ).toString() ) )
app.get( '/ping/get', (req, res) => res.send( lastping.toString() ) )

app.listen( PORT )