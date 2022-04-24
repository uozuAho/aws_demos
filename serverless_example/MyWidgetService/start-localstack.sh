#!/bin/bash

docker run --pull=always --rm -it \
  -v '//var//run//docker.sock:/var/run/docker.sock' \
  -p 4566:4566 -p 4571:4571 \
  localstack/localstack

# Explanation of (some) options:
#
# --------------------------------------------------------
# --pull=always
#
# Ensures you're running the latest version of localstack. Out of date images
# may have problems with CDK features.
#
# --------------------------------------------------------
# -v '//var//run//docker.sock:/var/run/docker.sock'
#
# Allows localstack to run lambdas in docker containers. If not provided,
# executors run in local mode, which has issues: https://github.com/localstack/localstack/issues/5131
#
# Note that the double slashes are to prevent windows path substitution. May
# not work on mac/linux.
#
# See
# - https://docs.localstack.cloud/localstack/lambda-executors/
# - https://stackoverflow.com/questions/42939423/docker-for-windows-equivalent-for-v-var-run-docker-sock-var-run-docker-sock
