# Transfer family: SFTP -> S3

Built following https://docs.aws.amazon.com/transfer/latest/userguide/getting-started.html

Also see https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/aws-transfer-sftp-server

# Getting started
```sh
# deploy infra
cd infra/tf-ftp-s3-demo
aws sso login
cdk deploy

# get public key that was created
keyid=$(aws ec2 describe-key-pairs --filters Name=key-name,Values=tf-ftp-user --query KeyPairs[*].KeyPairId --output text)
# NOTE: MSYS_NO_PATHCONV=1 is only required if you're on msys/cygwin
MSYS_NO_PATHCONV=1 aws ssm get-parameter --name /ec2/keypair/$keyid --with-decryption \
    --query Parameter.Value --output text > private.pem
pubkey=$(ssh-keygen -y -f private.pem)
echo $pubkey

# Now:
# - copy the value of the public key
# - paste it over PUB_KEY_HERE in infra/tf-ftp-s3-demo/lib/tf-ftp-s3-demo-stack.ts
# - uncomment the block of code that you pasted the public key into
cdk diff   # ensure a user will be created
cdk deploy

# Get the endpoint of your server, eg:
aws transfer list-servers
aws transfer describe-server --server-id s-5288c1401ec349c6a --query "Server.EndpointDetails.Address"
# TODO: I get null back here, why?
# workaround: get the endpoint from aws console

sftp -i private.pem demo-user@<ENDPOINT>
# you should now be at an sftp prompt
pwd                   # you should be at /home/demo-user
put package.json      # add a file!
# TODO: I get permission denied
```

# todo
- change iam role to s3 all permissions?
- how to get ftp server endpoint via cli?
