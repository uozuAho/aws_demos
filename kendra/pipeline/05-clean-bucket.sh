#!/bin/bash

set -eu

BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' \
  --output text | tr '\t' '\n' | grep -i kendra)

aws s3 rm s3://$BUCKETNAME/ --recursive --exclude "data/*" --exclude "metadata/*"
