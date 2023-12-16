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
./fill_bucket.sh
./run_comprehend.sh
# wait for job to complete, should have created an output/ dir in s3
```
