-- prepare orcale source db for AWS DMS usage
-- see https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.Oracle.html#CHAP_Source.Oracle.Amazon-Managed

GRANT CREATE SESSION to SRCADMIN;
GRANT SELECT ANY TRANSACTION to SRCADMIN;
-- these fail with 'you can't grant/revoke privileges to/from yourself'
-- I think admin may already have these privileges
-- GRANT SELECT on DBA_TABLESPACES to admin;
-- GRANT SELECT ON any-replicated-table to admin;
-- GRANT EXECUTE on rdsadmin.rdsadmin_util to admin;
 -- For Oracle 12c or higher:
GRANT LOGMINING to SRCADMIN;

exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_VIEWS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_TAB_PARTITIONS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_INDEXES', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_OBJECTS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_TABLES', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_USERS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_CATALOG', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_CONSTRAINTS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_CONS_COLUMNS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_TAB_COLS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_IND_COLUMNS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_LOG_GROUPS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$ARCHIVED_LOG', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$LOG', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$LOGFILE', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$DATABASE', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$THREAD', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$PARAMETER', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$NLS_PARAMETERS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$TIMEZONE_NAMES', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$TRANSACTION', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$CONTAINERS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('DBA_REGISTRY', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('OBJ$', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('ALL_ENCRYPTED_COLUMNS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$LOGMNR_LOGS', 'SRCADMIN', 'SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$LOGMNR_CONTENTS','SRCADMIN','SELECT');
exec rdsadmin.rdsadmin_util.grant_sys_object('DBMS_LOGMNR', 'SRCADMIN', 'EXECUTE');

-- (as of Oracle versions 12.1 and higher)
exec rdsadmin.rdsadmin_util.grant_sys_object('REGISTRY$SQLPATCH', 'SRCADMIN', 'SELECT');
-- (for Amazon RDS Active Dataguard Standby (ADG))
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$STANDBY_LOG', 'SRCADMIN', 'SELECT');
-- (for transparent data encryption (TDE))
exec rdsadmin.rdsadmin_util.grant_sys_object('ENC$', 'SRCADMIN', 'SELECT');
-- (for validation with LOB columns)
exec rdsadmin.rdsadmin_util.grant_sys_object('DBMS_CRYPTO', 'SRCADMIN', 'EXECUTE');
-- (for binary reader)
exec rdsadmin.rdsadmin_util.grant_sys_object('DBA_DIRECTORIES','SRCADMIN','SELECT');
-- Required when the source database is Oracle Data guard, and Oracle Standby
-- is used in the latest release of DMS version 3.4.6, version 3.4.7, and higher.
exec rdsadmin.rdsadmin_util.grant_sys_object('V_$DATAGUARD_STATS', 'SRCADMIN', 'SELECT');


-- I skipped Prerequisites for handling open transactions for Oracle Standby
-- because I don't know what it means, and I don't know who the DMS user is

exec rdsadmin.rdsadmin_util.set_configuration('archivelog retention hours', 24);
commit;
exec rdsadmin.rdsadmin_util.alter_supplemental_logging('ADD');
exec rdsadmin.rdsadmin_util.alter_supplemental_logging('ADD','PRIMARY KEY');

exec rdsadmin.rdsadmin_master_util.create_archivelog_dir;
exec rdsadmin.rdsadmin_master_util.create_onlinelog_dir;
-- these also fail with 'you can't grant/revoke privileges to/from yourself'
-- GRANT READ ON DIRECTORY ONLINELOG_DIR TO SRCADMIN;
-- GRANT READ ON DIRECTORY ARCHIVELOG_DIR TO SRCADMIN;
