#!/bin/bash

set -eu

BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' \
  --output text | tr '\t' '\n' | grep -i kendra)
COMPREHEND_OUTPUT_PATH=output
METADATA_FOLDER=metadata/

pushd converter
if [ ! -d ".venv" ]; then
  py -m venv .venv
fi
source .venv/Scripts/activate
pip install -r requirements.txt
py converter.py \
  --bucket $BUCKETNAME \
  --filepath $COMPREHEND_OUTPUT_PATH \
  --meta_folder $METADATA_FOLDER
deactivate
popd
