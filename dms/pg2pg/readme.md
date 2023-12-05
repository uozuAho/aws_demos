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
```

# todo
- test if i can connect to local pg from external psql (pi)
    - add any needed notes about port forwarding etc
    - try from vpn?
- follow manual steps from here onwards https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
    - try creating iam instance profile in cdk - stack fails to delete with
      manually created profile
    - migration project still fails with 'internal error'? debug a bit, try again
- automate from here onwards: https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-5.html
- have a look at https://github.com/aws-samples/dms-cdk/tree/main
