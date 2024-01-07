# Tiny glue demo: postgres to postgres in same VPC

Work in progress

# Quick start
```sh
pushd infra/glue_demo
npm i
cdk deploy
popd
./seed_src_db.sh
./get_jdbc_driver.sh
```

Manually create a glue job to copy data from the src to tgt database
in this stack. The job currently breaks, can't remember why

# To do
- get glue transfer from src to tgt working
- add glue job to infra
