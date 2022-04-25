# Serverless app demo, built with CDK & TypeScript

following https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html

## todo
- localstack: fix key error in lambda
  - error response from api: "The AWS Access Key Id you provided does not exist in our records"
    - probably this? https://docs.localstack.cloud/tools/local-endpoint-injection/
    - possibly related:
      - https://github.com/localstack/localstack/issues/2957
      - https://stackoverflow.com/questions/63793394/localstack-on-docker-with-net-s3-sdk-throws-the-aws-access-key-id-you-provided
- finish tute. up to "Add the individual widget functions"
- how to run widget service locally, with other services in localstack/AWS?

## Required software
- docker (for localstack)
- aws cli
- aws cdk
- [cdklocal](https://github.com/localstack/aws-cdk-local)
- node

## Quick start
Note: replace `cdk` with `cdklocal` to deploy to localstack instead of AWS.

```sh
./start-localstack.sh  # if using localstack
npm i
cdk bootstrap          # assumes you're logged into AWS
cdk deploy
```

Once deployment completes, the cdk should output a link to the created API, eg.

https://hvmvmrqbpk.execute-api.localhost.localstack.cloud:4566/prod/

When visited, the response should be something like `widgets: []`.


## Notable differences from AWS tute
- This project installs and deploys aws-sdk as part of the lambda. This is due
  to issues running the lambda in 'local mode' on localstack. See
  https://github.com/aws-samples/aws-cdk-examples/issues/110


## Useful commands

https://hvmvmrqbpk.execute-api.localhost.localstack.cloud:4566/prod/

* `aws [--endpoint-url=http://localhost:4566] apigateway get-rest-apis`
  * Get rest APIs. APIs can be accessed at
    * AWS: https://{API ID}.execute-api.{region}.amazonaws.com/prod/
    * localstack: https://{API ID}.execute-api.localhost.localstack.cloud:4566/prod/
  * see https://docs.aws.amazon.com/cli/latest/reference/apigateway/get-rest-api.html
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
