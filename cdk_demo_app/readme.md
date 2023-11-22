# CDK demo app

A few cdk demo apps, built by following:

- [cdk getting started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
- [cdk hello world app](https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html)
- [cdk workshop](https://cdkworkshop.com/)
    - up to https://cdkworkshop.com/20-typescript/30-hello-cdk/300-cdk-watch.html

# Quick-ish start:
- install latest node (I used 20.x)
- install aws cli
- I'm using IAM Identity Center for auth. To set this up:
    - create iam identity center user + permission set for dev user
    - install the latest aws cli: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    - set up cli sso access: https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html
        - **don't user poweruser**! otherwise cdk bootstrap fails later. Use
          admin permission set. Seems wrong, but it's what works. I submitted
          feedback to AWS about this.
- install cdk globally `npm install -g aws-cdk`
- `cdk bootstrap aws://ACCOUNT-NUMBER/REGION` if you haven't used CDK before in
  your aws region

Then, in any project subdirectory (hello-cdk, cdk-workshop):

```sh
npm i
cdk ls       # list stacks
cdk deploy
cdk destroy

# optional
npx cdk-dia   # draw AWS infra diagram (requires graphviz)
```

# Troubleshooting
- "The security token included in the request is invalid" on `cdk bootstrap`
    - make sure you've done `aws sso login`
    - not sure why. I deleted ~/.aws/credentials and got past this error

- `cdk bootstrap` fails to create resources/IAM roles
    - make sure you're using an IAM user with the admin permission set. Not sure
      this is recommended, but the poweruser permission set doesn't have enough
      perms to succeed here.

# notes
```sh
cdk init app --language typescript   # init cdk infra app
npm run build                        # transpile js
cdk ls                               # list stacks
cdk synth                            # output cfn to stdout and cdk.out/
cdk deploy                           # deploy stack to AWS
cdk deploy --hotswap                 # fast deploy stack to AWS (causes drift, use for dev only)
                                     #    handy for lambda dev
cdk diff                             # diff local stack against deployed stack
cdk destroy                          # delete stack(s)
```

Note that `cdk destroy` doesn't get rid of everything. For example, cloudwatch
logs.


# further exercises
- testing constructs: https://cdkworkshop.com/20-typescript/70-advanced-topics/100-construct-testing.html
- pipelines: https://cdkworkshop.com/20-typescript/70-advanced-topics/200-pipelines.html
- remove JSON.parse from cdk-workshop/lambda/hitcounter response. This causes
  API to return 502, but lambda logs are fine, and there's no API gateway logs.
  What's the best way to debug this? Took me a while to figure out, eventually
  by testing via AWS console -> API Gateway test
