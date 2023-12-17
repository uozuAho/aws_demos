# Tiny glue demo: postgres to postgres in same VPC

```sh
pushd infra/glue_demo
npm i
cdk deploy
popd
./seed_src_db.sh
./get_jdbc_driver.sh
```
