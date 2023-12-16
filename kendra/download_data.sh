#!/bin/bash

mkdir -p temp
curl -o temp/tutorial-dataset.zip \
  https://docs.aws.amazon.com/kendra/latest/dg/samples/tutorial-dataset.zip
unzip temp/tutorial-dataset.zip -d temp/
