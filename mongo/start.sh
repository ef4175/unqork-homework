#!/usr/bin/env bash

docker run -it \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=example \
  --rm mongo:4.0.3
