# Serverless app demo, built with CDK & TypeScript

following https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## todo
- cdklocal: deployed api throws error
  - cdk is fine (matches expected output from tute)

## Required software
- docker (for localstack)
- aws cli
- aws cdk
- [cdklocal](https://github.com/localstack/aws-cdk-local)
- node

## Quick start
Note: replace `cdk` with `cdklocal` to deploy to localstack instead of AWS.

```sh
npm i
cdk bootstrap  # assumes you're logged into AWS
cdk deploy
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
