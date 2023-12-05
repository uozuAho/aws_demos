# DMS postgres to postgres demo

Built following https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql.html
Homogeneous postgres to postgres migration.

# Getting started

```sh
aws sso login
cd infra/local
./init_db.sh
cd ../dms-pg2pg
cdk deploy
```

# todo
- follow as closely as possible. Run pg locally & port forward?
