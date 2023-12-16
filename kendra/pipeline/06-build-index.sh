#!/bin/bash

# assumes there's only one kendra index in your account
INDEX_ID=$(aws kendra list-indices --query "IndexConfigurationSummaryItems[*].Id" --output text)
DATA_SOURCE_ID=$(aws kendra list-data-sources \
  --index-id $INDEX_ID \
  --query "SummaryItems[?Name=='kendra-demo-data-source'].Id" \
  --output text)
REGION=ap-southeast-2

aws kendra start-data-source-sync-job \
  --id $DATA_SOURCE_ID \
  --index-id $INDEX_ID \
  --region $REGION
# this outputs an execution id

# check status with:
# aws kendra list-data-source-sync-jobs \
#   --id $DATA_SOURCE_ID \
#   --index-id $INDEX_ID \
#   --region $REGION

# or look in aws console -> kendra -> data sources -> kendra-demo-data-source
