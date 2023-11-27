# DMS demo project

Built following this AWS tutorial:
[Getting started with AWS Database Migration Service](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.html)

# Abandoned
There's too many problems with DMS, so I gave up on this one. See 'todo'
downwards for where to continue from where I left.

Problems:
- DMS schema conversion doesn't seem to support mariadb source -> postgres target,
  although it's suggested as an option here: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.SCT.html
- SCT seems GUI-based, and the CLI install & usage instructions are lacking.
  I didn't want to install it locally, so gave up on it.

Also note that the DB & EC2 instances in this demo are huge, and creating the
seed data takes ~45min. It's probably better worth your time just manually
creating something small to play with. Maybe try completing ../oracle_migrate
instead!


# todo
- WIP: up to step 4.: convert source to target schema. log:
    - DMS schema conversion is giving me dumb errors, try SCT instead?
    - SCT uses a GUI, blergh
    - back to DMS schema conversion. instance profile worked this time, wtf
    - now breaks at configure data provider. fails with 'Certificate should not
      be empty' nowhere to put cert. No SSL then!
    - DMS schema conversion doesn't support mariadb to postgres?? wtf? tutorial
      is borked.
    - back to sct....
    - maybe
        - try the 'get started' guide at the aws dms service console


# steps to make this work
- follow the cdk demo app to get aws cli & cdk working
- install node 20

```sh
# ----------------------------------------
# deploy infra
cd infra/dms-demo
npm i
aws sso login
cdk deploy       # takes ~10 min

# ----------------------------------------
# seed database
keyid=$(aws ec2 describe-key-pairs --filters Name=key-name,Values=dmsdemo --query KeyPairs[*].KeyPairId --output text)
# NOTE: MSYS_NO_PATHCONV=1 is only required if you're on msys/cygwin
MSYS_NO_PATHCONV=1 aws ssm get-parameter --name /ec2/keypair/$keyid --with-decryption \
    --query Parameter.Value --output text > ec2client.pem
ec2ip=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=DmsDemoStack/dms-demo-client" --query "Reservations[*].Instances[*].PublicIpAddress" --output text)
mariaDbId=$(aws rds describe-db-instances | jq -r '.DBInstances[] | select(.DBInstanceIdentifier | contains("dmsmariadb")) .DBInstanceIdentifier')
mariaDbEndpoint=$(aws rds describe-db-instances --db-instance-identifier $mariaDbId --query 'DBInstances[*].Endpoint.Address' --output text)
# copy the output of mariaDbEnpoint, paste over YOUR_MARIADB_ENDPOINT below:
echo $mariaDbEndpoint
mariaDbAdminPassword=$(aws secretsmanager get-secret-value --secret-id dms-demo-mariadb-creds --query SecretString --output text | jq -r .password)
# you'll be prompted for this password when running the mysql command below:
echo $mariaDbAdminPassword
ssh -i ec2client.pem ec2-user@$ec2ip
# note: now you're ssh-d into an EC2 instance
git clone https://github.com/aws-samples/aws-database-migration-samples.git
cd aws-database-migration-samples/mysql/sampledb/v1
# note: the following command will take ~45 min, and there will be a lot of
#       errors, ignore them
mysql -h YOUR_MARIADB_ENDPOINT -P 3306 -u admin -p dms_demo < install-rds.sql


# ----------------------------------------
# schema conversion
cd
# check for latest version here: https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Installing.html#CHAP_Installing.Procedure
mkdir sct
cd sct
wget https://s3.amazonaws.com/publicsctdownload/Fedora/aws-schema-conversion-tool-1.0.latest.zip
unzip aws-schema-conversion-tool-1.0.latest.zip
sudo yum install aws-schema-conversion-tool-1.0.674-1.x86_64.rpm
# is it doable via cli????????????
```

# maybe/later
- convert ec2 instance to a launch template?
- reduce instance sizes
- automate step 5. of populating the db here: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.Prerequisites.html
    - note that git repo is checked out under / as root
- extract infra to separate constructs?
