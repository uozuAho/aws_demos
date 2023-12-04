#!/bin/bash

SQLCL_PATH=/c/woz/apps/sqlcl/bin/sql.exe

# seed some data
$SQLCL_PATH $SRC_DB_CONNECTION_STRING @seed_db.sql
# configure settings/permissions to enable DMS
$SQLCL_PATH $SRC_DB_CONNECTION_STRING @prep.sql
