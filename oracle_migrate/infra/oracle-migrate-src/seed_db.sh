#!/bin/bash

SQLCL_PATH=/c/woz/apps/sqlcl/bin/sql.exe

$SQLCL_PATH $DB_CONNECTION_STRING @seed_db.sql
