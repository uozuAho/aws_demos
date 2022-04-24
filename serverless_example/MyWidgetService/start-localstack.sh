#!/bin/bash

docker run --pull=always --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
