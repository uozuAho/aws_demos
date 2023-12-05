#!/bin/bash
#
# Wipes and recreates a database, ready for DMS migration

set -eu

# restart db
docker stop dmstest_pg || true
docker run --rm --name dmstest_pg -e POSTGRES_PASSWORD=dmstestYo -e \
    POSTGRES_USER=postgres -e POSTGRES_DB=dmstest -p 5432:5432 -d postgres

# seed data & configure dms
docker cp data.sql dmstest_pg:/data.sql
docker cp configure_dms.sql dmstest_pg:/configure_dms.sql
sleep 3
MSYS_NO_PATHCONV=1 docker exec dmstest_pg psql -U postgres -d dmstest -f /data.sql
MSYS_NO_PATHCONV=1 docker exec dmstest_pg psql -U postgres -d dmstest -f /configure_dms.sql
