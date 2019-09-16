const VERBOSE = process.env.VERBOSE == "true"
const MAX_PING_DELTA = process.env.MAX_PING_DELTA
const PING_URL = process.env.PING_URL
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
      const response = await fetch(PING_URL)
      const pingtime = parseInt( await response.text() )
      const pingdelta = Math.floor( .001 * (new Date().getTime() - pingtime) )
      if ( VERBOSE )
        console.log( `\x1b[${pingdelta>.9?93:94};1m${pingdelta}\x1b[0;94m seconds since last ping\x1b[0m` )
      if ( pingdelta > MAX_PING_DELTA )
      {
        console.log("That's it! i'm killing the vm...")
        await stopinstance()
        return
      }
    }
    catch( e ) { console.error( e ) }
  }
}

loop()