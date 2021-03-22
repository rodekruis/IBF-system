#!/bin/bash

function prepare() {
  echo 'Running prepare test.'
  echo 'Running docker-compose up -d ibf-api-service ibf-dashboard'
  docker-compose up -d ibf-api-service ibf-dashboard 
  echo 'docker ps -a'
  docker ps -a
  echo 'Running database migration.'
  migrate_database
  echo 'Running seed.'
  docker-compose exec -T ibf-api-service npm run seed
  echo 'docker ps -a2 '
  docker ps -a
}


function migrate_database() {
  echo migrate_database
  PGPASSWORD=$DB_PASSWORD_TEST_VM pg_dump -U "$DB_USERNAME_TEST_VM"  -Fc -Z 9 -f tools/db-dumps/ibf.dump -h "$DB_HOST_TEST_VM"  geonode_datav3
  PGPASSWORD=$DB_PASSWORD_TEST_VM pg_restore --clean -U "$DB_USERNAME_TEST_VM" -Fc -j 8 -h "$DB_HOST_TEST_VM" -d "$DB_DATABASE" tools/db-dumps/ibf.dump 
    #  PGPASSWORD=$DB_PASSWORD_TEST_VM psql -U $DB_USERNAME_TEST_VM -d $DB_DATABASE_GITHUB_ACTIONS -h $DB_HOST_TEST_VM -c 'CREATE EXTENSION postgis'

    # declare -a arr=("IBF-static-input" "IBF-pipeline-output" "IBF-API" )
   

    # for SCHEMA in "${arr[@]}"
    # do
    #     echo "$SCHEMA"
    #     rm -f tools/db-dumps/ibf_$SCHEMA.dump
        
    #     echo pg_dump -U $DB_USERNAME_TEST_VM -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h $DB_HOST_TEST_VM -n \"$SCHEMA\" geonode_datav3
    #     PGPASSWORD=$DB_PASSWORD_TEST_VM pg_dump -U "$DB_USERNAME_TEST_VM" -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h "$DB_HOST_TEST_VM" -n \"$SCHEMA\" geonode_datav3

    #     echo psql -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM"  -c 'drop schema "'$SCHEMA'" cascade;'
    #     PGPASSWORD=$DB_PASSWORD_TEST_VM psql -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM" -c 'drop schema "'$SCHEMA'" cascade;'

    #     echo psql -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM"  -c 'create schema "'$SCHEMA'";'
    #     PGPASSWORD=$DB_PASSWORD_TEST_VM psql -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM"  -c 'create schema "'$SCHEMA'";'
        
    #     echo  pg_restore -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM"  --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
    #     PGPASSWORD=$DB_PASSWORD_TEST_VM pg_restore -U $DB_USERNAME_TEST_VM -d "$DB_DATABASE" -h "$DB_HOST_TEST_VM"  --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
    # done
}

prepare