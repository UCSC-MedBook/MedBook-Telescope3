#! /usr/bin/env bash

cd /app-dev
cp --no-clobber -r /app/* /app-dev
export MONGO_URL=mongodb://mongo:${MONGO_PORT_27017_TCP_PORT}/MedBook
meteor --release $RELEASE
