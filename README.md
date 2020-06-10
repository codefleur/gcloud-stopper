# Google Cloud Compute Engine Instance Stopper

This is a tiny node server, which keeps track of the last time it was pinged at `/ping/update`.

Set the id and zone of a compute instance and maximum ping delta, to automatically stop that instance if not pinged for the specified time.

You can choose to create a powerful vm on GCP, host this app somewhere live (e.g. on the actual vm in question) and set up a program to ping it regularly while working. It will gracefully shut down when you stop.

## Example pinger javascript snippet

```js
var pinger = {
  ping_url: "https://example.com:1234/ping/update",
  last_ping_time: 0,
  running: false,
  delay: function( time ) { 
    return new Promise( ( res ) => setTimeout( () => res(), 1000.0 * time ) ) 
  },
  start: async function( interval ) {
    this.running = true
    while ( this.running ) {
      if( document.visibilityState == "visible" && document.hasFocus() ) {
        let r = await fetch( this.ping_url )
        let t = await r.text()
        this.last_ping_time = this.now()
      }
      await this.delay( interval )
    }
  },
  now: () => new Date().getTime() * .001
}
```

## Example docker compose:

```yaml
version: "2"
services:
  codestopper:
    image: codefleur/gcloud-stopper
    container_name: gcloud-stopper
    restart: unless-stopped
    ports:
      - 1234:1234
    environment:
      - VERBOSE=false
      - MAX_PING_DELTA=900 # 15 minutes
      - COMPUTE_ZONE=europe-west3-c
      - COMPUTE_INSTANCE=beast
```

For automatically starting a Compute instance, you can check out [this repo](https://github.com/codefleur/gcloud-starter).