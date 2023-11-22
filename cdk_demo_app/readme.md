# CDK demo app

Following:

- [cdk getting started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
- [cdk hello world app](https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html)

# Quick-ish start:
- I'm using IAM Identity Center for auth. To set this up:
    - create iam identity center user + permission set for dev user
    - install the latest aws cli: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    - set up cli sso access: https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html
        - **don't user poweruser**! otherwise cdk bootstrap fails later. Use
          admin permission set. Seems wrong, but it's what works. I submitted
          feedback to AWS about this.
- install cdk globally `npm install -g aws-cdk`
- WIP: bootstrap (create AWS resources necessary for cdk to work)
    - `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`
    - see troubleshooting

# Troubleshooting
- "The security token included in the request is invalid" on `cdk bootstrap`
    - make sure you've done `aws sso login`
    - not sure why. I deleted ~/.aws/credentials and got past this error

- `cdk bootstrap` fails to create resources/IAM roles
    - make sure you're using admin access. Not sure this is recommended, but
      poweruser doesn't have enough perms to succeed here
