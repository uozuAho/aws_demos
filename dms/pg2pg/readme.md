# DMS postgres to postgres demo

Built following https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql.html
Homogeneous postgres to postgres migration.

# Getting started
Install docker, aws cli, cdk, jq.

```sh
aws sso login
cd infra/local
./init_db.sh
./save_secrets_to_aws.sh
cd ../dms-pg2pg
cdk deploy
# wait ~10 minutes
cd my_stuff
# choose a password here for your RDS DMS user:
echo export RDS_PG_DMS_USER_PASSWORD=CHOOSE_A_PASSWORD > .secrets
. get_secrets.sh
./config_dms_user.sh
# allow connections to your local postgres. This will likely need you to:
# - forward external connections on port 5432 on your router to your local machine
# - add an inbound rule on your local machine's firewall

# connect to target db as admin
docker run --rm -it postgres psql $RDS_PG_CONNECTION_STRING
```

# todo
- may need to create empty db on target first
    - revisit config_dms_user after doing so
- target db creds no good? just use postgres user?
- fix docs?: https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
    - target needs replication enabled for DMS
- automate from here onwards: https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
- have a look at https://github.com/aws-samples/dms-cdk/tree/main

# log
- following manual steps from here onwards https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
    - 1st attempt: migration project  fails with 'internal error'?
    - 2nd+ atttemp: migration project fails due to target logical replication not being enabled.
        - attempt fix: manually create param group
            - rds.logical_replication = 1
            - max_logical_replication_workers = 5
        - apply immediately to existing rds, restart migration project
        - failed with same error. reboot rds & restart migration
        - failed with same error. try creating param croup in cdk and redeploy
        - rds.logical_replication is invalid for instance, only use for cluster (?)
            - also doesn't work for cluster. can't do via cdk???
        - try manually setting rds.logical_replication to running instance
            - sets, reboots, replication still off initially, but turns on
                - (check with `SELECT name,setting FROM pg_settings WHERE name IN ('wal_level','rds.logical_replication');`)
    - 3rd attempt: internal error again. no cloudwatch logs even though they
      were enabled
