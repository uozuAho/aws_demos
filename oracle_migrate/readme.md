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
./prep_src_db.sh

# when finished:
cdk destroy
```

# todo
- easy mode: transfer to a DB in the same account and region
    - DONE: setup. Note that I skipped db backup and restore.
    - do "Create AWS DMS components" in https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/migrate-an-amazon-rds-for-oracle-database-to-another-aws-account-and-aws-region-using-aws-dms-for-ongoing-replication.html?did=pg_card&trk=pg_card
        - WIP: manually creating a replication instance. There's no available
          subnet groups in the source VPC. I selected default. Fails to create
          with 'IAM role is not configured properly'. Try to create a subnet
          group, then see if it can create an instance.
    - finish dms setup guide for oracle
        - **todo**: where to put 'useLogminerReader=N;useBfile=Y'
            - oracle source prep says "Set the following extra connection attributes
              on the Amazon RDS Oracle source endpoint" : https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.Oracle.html#CHAP_Source.Oracle.Amazon-Managed
- follow the full arch guide, doing cross-account restore & replicate
- draw arch


# maybe/later
- copy a subset of tables and rows to a postgres database
- get rid of NAT gateways that come with VPC
