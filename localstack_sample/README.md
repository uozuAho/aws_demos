# Localstack sample app, built with CDK

Demonstrates a CDK app with an instance of a stack (`LocalstackSampleStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

Not fully functional: bootstrapping doesn't work, and there's no easy way to
interact with the deployed stack.

This was created by installing [cdklocal](https://github.com/localstack/aws-cdk-local)
then running `cdklocal init sample-app --language=javascript`.

## Required software
- docker
- aws cli
- node

## Quick start
```sh
npm i
npm test
cdk synth > sample.yml  # output cloudformation
./start-localstack

# deploy
aws --endpoint-url=http://localhost:4566 cloudformation deploy \
  --template-file sample.yml \
  --stack-name sample \
  --region ap-southeast-2

# list resources
aws --endpoint-url=http://localhost:4566 cloudformation list-stacks
aws --endpoint-url=http://localhost:4566 sns list-topics

# delete resources
aws --endpoint-url=http://localhost:4566 cloudformation delete-stack --stack-name sample

# doesn't work
cdklocal bootstrap aws://000000000000/ap-southeast-2  # fails to create stack, dunno why
cdklocal deploy  # requires bootstrap
```
