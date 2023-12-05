#!/bin/bash

db_secret=$(aws secretsmanager get-secret-value --secret-id dms-pg2pg-pg-creds)
db_username=$(echo $db_secret | jq -r '.SecretString' | jq -r '.username')
db_password=$(echo $db_secret | jq -r '.SecretString' | jq -r '.password')
db_endpoint=$(echo $db_secret | jq -r '.SecretString' | jq -r '.host')
db_db=$(echo $db_secret | jq -r '.SecretString' | jq -r '.dbname')
db_port=$(echo $db_secret | jq -r '.SecretString' | jq -r '.port')

export RDS_PG_CONNECTION_STRING="postgresql://$db_username:$db_password@$db_endpoint:$db_port"
. .secrets
