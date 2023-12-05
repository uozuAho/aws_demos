CREATE USER dmsTgtUser WITH LOGIN PASSWORD 'RDS_PG_DMS_USER_PASSWORD';
GRANT USAGE ON SCHEMA public TO dmsTgtUser;
-- docs aren't clear as to whether I need to create a database first or not
-- see https://docs.aws.amazon.com/dms/latest/sbs/dm-postgresql-step-3.html
GRANT CONNECT ON DATABASE uh_some_db to dmsTgtUser;
GRANT CREATE ON DATABASE uh_some_db TO dmsTgtUser;
GRANT CREATE ON SCHEMA public TO dmsTgtUser;
GRANT UPDATE, INSERT, SELECT, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO dmsTgtUser;
