#!/bin/bash
#
# Get a recent JDBC driver to use with Glue. For some reason, glue uses a very
# old driver that fails to connect to postgres.

if [ ! -f temp/postgresql-42.7.1.jar ]; then
    mkdir -p temp
    curl -o temp/postgresql-42.7.1.jar https://jdbc.postgresql.org/download/postgresql-42.7.1.jar
fi

BUCKETNAME=$(aws s3api list-buckets --query 'Buckets[].Name' --output text \
  | tr '\t' '\n' | grep -i glue)

aws s3 cp temp/postgresql-42.7.1.jar s3://$BUCKETNAME/jdbc/postgresql-42.7.1.jar
