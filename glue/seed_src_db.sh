#!/bin/bash

db_secret=$(aws secretsmanager get-secret-value --secret-id src-db-creds)
db_username=$(echo $db_secret | jq -r '.SecretString' | jq -r '.username')
db_password=$(echo $db_secret | jq -r '.SecretString' | jq -r '.password')
db_endpoint=$(echo $db_secret | jq -r '.SecretString' | jq -r '.host')
db_db=$(echo $db_secret | jq -r '.SecretString' | jq -r '.dbname')
db_port=$(echo $db_secret | jq -r '.SecretString' | jq -r '.port')

SRC_CONNECTION_STRING="postgresql://$db_username:$db_password@$db_endpoint:$db_port"
SQL_FILE=seed.sql

MSYS_NO_PATHCONV=1 docker run -it -v $(pwd):/var/lib/postgresql/data \
  postgres psql $SRC_CONNECTION_STRING -f /var/lib/postgresql/data/$SQL_FILE
