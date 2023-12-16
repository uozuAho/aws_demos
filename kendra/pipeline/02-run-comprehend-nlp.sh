#!/bin/bash
# Runs AWS comprehend on text data in an s3 bucket, as per
# https://docs.aws.amazon.com/kendra/latest/dg/tutorial-search-metadata-entities-analysis.html

REGION=ap-southeast-2
BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | grep -i kendra)
ROLE_ARN=$(aws iam list-roles --query 'Roles[].Arn' --output text | tr '\t' '\n' | grep -i 'kendra.*comprehend')

aws comprehend start-entities-detection-job \
  --input-data-config S3Uri=s3://$BUCKETNAME/data/,InputFormat=ONE_DOC_PER_FILE \
  --output-data-config S3Uri=s3://$BUCKETNAME/ \
  --data-access-role-arn $ROLE_ARN \
  --job-name data-entities-analysis \
  --language-code en \
  --region $REGION
# this will output a job id

# get the status of the job:
# aws comprehend describe-entities-detection-job \
#   --job-id de20b06443c67beb5b665993686712f9 \
#   --region $REGION
