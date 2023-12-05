#!/bin/bash

set -eu

LOCAL_IP=$(curl ifcfg.me)
TEMP_SECRETS_FILE=secrets.json

cat secrets.template.json | \
  sed "s/MY_LOCAL_IP/$LOCAL_IP/g" > $TEMP_SECRETS_FILE

aws secretsmanager create-secret --name dms-pg2pg-localpg-creds \
    --description "aws demos project: Credentials for local postgres db" \
    --secret-string file://$TEMP_SECRETS_FILE

rm $TEMP_SECRETS_FILE
