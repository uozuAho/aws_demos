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
- try postgres-postgres homogenous guide:
    - https://docs.aws.amazon.com/dms/latest/userguide/dm-getting-started.html
    - https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql.html
- try aborted oracle->oracle dms under 'maybe/later'
- follow the full arch guide, doing cross-account restore & replicate
- draw arch

# maybe/later
- ABORTED: easy mode: transfer to a DB in the same account and region
    - DONE: setup. Note that I skipped db backup and restore.
    - WIP: do "Create AWS DMS components" in https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/migrate-an-amazon-rds-for-oracle-database-to-another-aws-account-and-aws-region-using-aws-dms-for-ongoing-replication.html?did=pg_card&trk=pg_card
        - DONE: manually created a replication instance. Failed until i created
          a separate subnet group. meh: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.Replication.html
        - WIP: create endpoints. So manual and tedious. Needs oracle stuff
          that hasn't been mentioned before. Ugh.
    - maybe: finish dms setup guide for oracle
        - **todo**: where to put 'useLogminerReader=N;useBfile=Y'
            - oracle source prep says "Set the following extra connection attributes
              on the Amazon RDS Oracle source endpoint" : https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.Oracle.html#CHAP_Source.Oracle.Amazon-Managed
- copy a subset of tables and rows to a postgres database
- get rid of NAT gateways that come with VPC
