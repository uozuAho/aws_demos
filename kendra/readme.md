# Kendra

Built following https://docs.aws.amazon.com/kendra/latest/dg/tutorial-search-metadata.html

architecture/workflow:
    text docs ---------------------------------> kendra
        |                                           ^
        ----> s3 -> comprehend (NLP) -> s3 ---------|

# Deploy the infra, run queries:
```sh
pushd infra/kendra_demo
npm i
cdk deploy
popd
pushd pipeline
./01-upload-docs.sh
./02-run-comprehend-nlp.sh
# todo: get job id from the above script, eg:
# COMPREHEND_JOB_ID=$(./02-run-comprehend-nlp.sh)
# wait for job to complete, should have created an output/ dir in s3
./03-extract-comprehend-output.sh
./04-comprehend-to-kendra.sh
./05-clean-bucket.sh
./06-build-index.sh
# todo: query the index! https://docs.aws.amazon.com/kendra/latest/dg/tutorial-search-metadata-query-kendra.html
# just search using the aws console

# when you're done
cdk destroy
```
