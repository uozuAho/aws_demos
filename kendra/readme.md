# Kendra

Built following https://docs.aws.amazon.com/kendra/latest/dg/tutorial-search-metadata.html

architecture/workflow:
    text docs ---------------------------------> kendra
        |                                           ^
        ----> s3 -> comprehend (NLP) -> s3 ---------|

# Go
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
```
