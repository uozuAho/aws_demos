#!/bin/bash

set -eu

TEMP_SQL_FILE=config_dms_user.sql.tmp

cat config_dms_user.sql \
  | sed "s/RDS_PG_DMS_USER_PASSWORD/$RDS_PG_DMS_USER_PASSWORD/g" \
  > $TEMP_SQL_FILE

# MSYS_NO_PATHCONV=1 docker run -it -v $(pwd):/var/lib/postgresql/data \
#   postgres psql $RDS_PG_CONNECTION_STRING -f /var/lib/postgresql/data/$TEMP_SQL_FILE

# rm $TEMP_SQL_FILE
