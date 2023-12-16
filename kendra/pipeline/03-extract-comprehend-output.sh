#!/bin/bash

REGION=ap-southeast-2
COMPREHEND_JOB_ID=de20b06443c67beb5b665993686712f9
BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' \
  --output text | tr '\t' '\n' | grep -i kendra)

COMPREHEND_OUTPUT_GZ=$(aws comprehend describe-entities-detection-job \
  --job-id de20b06443c67beb5b665993686712f9 \
  --region ap-southeast-2 \
  --query "EntitiesDetectionJobProperties.OutputDataConfig.S3Uri" \
  --output text)

mkdir -p temp/comprehend
aws s3 cp $COMPREHEND_OUTPUT_GZ temp/comprehend/output.tar.gz
tar -xzf temp/comprehend/output.tar.gz -C temp/comprehend/
aws s3 cp temp/comprehend/output s3://$BUCKETNAME/output
