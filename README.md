# Google Cloud Compute Engine Instance Stopper

This is a tiny node server, which keeps track of the last time it was pinged at `/ping/update`.

Set the id and zone of a compute instance and maximum ping delta, to automatically stop that instance if not pinged for the specified time.

You can choose to create a powerful vm on GCP, host this app somewhere live (e.g. on the actual vm in question) and set up a program to ping it regularly while working. It will gracefully shut down when you stop.

## Example docker compose:

```
version: "2"
services:
  codestopper:
    image: codefleur/gcloud-stopper
    container_name: gcloud-stopper
    restart: never
    ports:
      - 1234:1234
    environment:
      - VERBOSE=false
      - MAX_PING_DELTA=900 # 15 minutes
      - COMPUTE_ZONE=europe-west3-c
      - COMPUTE_INSTANCE=beast
```

For automatically starting a Compute instance, you can check out [this repo](https://github.com/codefleur/gcloud-starter).