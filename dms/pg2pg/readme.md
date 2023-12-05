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
- follow as closely as possible. Run pg locally & port forward?
    - up to https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-4.html
- have a look at https://github.com/aws-samples/dms-cdk/tree/main
