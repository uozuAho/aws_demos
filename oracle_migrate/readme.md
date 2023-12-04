# AWS arch demo: Migrate an Amazon RDS for Oracle database to another AWS account and AWS Region using AWS DMS for ongoing replication

Built following: https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/migrate-an-amazon-rds-for-oracle-database-to-another-aws-account-and-aws-region-using-aws-dms-for-ongoing-replication.html?did=pg_card&trk=pg_card

NOTE: This is a work in progress.

# get started
- see cdk_demo_app for how to get started with cdk
- install node 20
- install jq
- install the oracle sqlcl app from here: https://www.oracle.com/database/sqldeveloper/
    - I'll assume it's available in this dir as 'sql.exe'

```sh
aws sso login
cd infra/oracle-migrate-src
npm i
cdk deploy    # takes ~10 minutes
. get_secrets.sh
./seed_db.sh

# when finished:
cdk destroy
```

# todo
- easy mode: transfer to a DB in the same account and region
- finish arch guide
- draw arch


# maybe/later
- get rid of NAT gateways that come with VPC
