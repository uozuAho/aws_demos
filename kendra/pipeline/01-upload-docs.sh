#!/bin/bash

# mkdir -p temp
# curl -o temp/tutorial-dataset.zip \
#   https://docs.aws.amazon.com/kendra/latest/dg/samples/tutorial-dataset.zip
# unzip temp/tutorial-dataset.zip -d temp/

BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | grep -i kendra)

aws s3api put-object \
  --bucket $BUCKETNAME \
  --key data/

aws s3api put-object \
  --bucket $BUCKETNAME \
  --key metadata/

aws s3 cp temp/tutorial-dataset/data s3://$BUCKETNAME/data/ --recursive
