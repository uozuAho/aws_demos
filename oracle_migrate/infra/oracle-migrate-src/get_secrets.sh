#!/bin/bash

src_db_secret=$(aws secretsmanager get-secret-value --secret-id oracle-migrate-src-db-credentials)
src_db_username=$(echo $src_db_secret | jq -r '.SecretString' | jq -r '.username')
src_db_password=$(echo $src_db_secret | jq -r '.SecretString' | jq -r '.password')
src_db_endpoint=$(echo $src_db_secret | jq -r '.SecretString' | jq -r '.host')
src_db_db=$(echo $src_db_secret | jq -r '.SecretString' | jq -r '.dbname')
src_db_port=$(echo $src_db_secret | jq -r '.SecretString' | jq -r '.port')

export DB_CONNECTION_STRING="$src_db_username/$src_db_password@$src_db_endpoint:$src_db_port/$src_db_db"
