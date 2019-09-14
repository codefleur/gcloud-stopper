const VERBOSE = process.env.VERBOSE == "true"
const MAX_PING_DELTA = process.env.MAX_PING_DELTA
const PING_URL = process.env.PING_URL
const COMPUTE_ZONE = process.env.COMPUTE_ZONE
const COMPUTE_INSTANCE = process.env.COMPUTE_INSTANCE

const compute = new (require('@google-cloud/compute'))()

console.clear()
console.log(`\x1b[93mWill kill vm on ${MAX_PING_DELTA} seconds inactivity from codemaster\x1b[0m`)

async function stopinstance() {
  const zone = compute.zone(COMPUTE_ZONE)
  const [error, operation, response ] = await zone.vm(COMPUTE_INSTANCE).stop()
  await operation
  console.log("Instance stopped")
}

const fetch = require("node-fetch")
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function updateDomainIP() {
  const DUCKDNS_DOMAINS = process.env.DUCKDNS_DOMAINS
  const DUCKDNS_TOKEN = process.env.DUCKDNS_TOKEN
  const DUCKDNS_IPADDRESS = process.env.DUCKDNS_IPADDRESS
  const response = await fetch(`https://www.duckdns.org/update?domains=${DUCKDNS_DOMAINS}&token=${DUCKDNS_TOKEN}&ip=${DUCKDNS_IPADDRESS}&verbose=true`)
  console.log( await response.text() )
}

async function loop() {
  while( true )
  {
    await sleep(1000)
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
}

updateDomainIP()
loop()
