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
- follow manual steps from here onwards https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
    - 1st attempt: migration project  fails with 'internal error'?
    - 2nd atttemp: migration project fails due to target logical replication not being enabled.
        - attempt fix: manually create param group
            - rds.logical_replication = 1
            - max_logical_replication_workers = 5
        - apply immediately to existing rds, restart migration project
        - failed with same error. reboot rds & restart migration
        - failed with same error. try creating param croup in cdk and redeploy
        - rds.logical_replication is invalid for instance, only use for cluster (?)
        - try manually setting rds.logical_replication to running instance
            - sets, reboots, but replication still off (check with `SELECT name,setting FROM pg_settings WHERE name IN ('wal_level','rds.logical_replication');`)
        - still failed. tODO: create param group in cdk
            - if still fails, look at this: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PostgreSQL.Replication.ReadReplicas.html
- may need to create empty db on target first
    - revisit config_dms_user after doing so
- fix docs?: https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
    - target needs replication enabled for DMS
- automate from here onwards: https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
- have a look at https://github.com/aws-samples/dms-cdk/tree/main
