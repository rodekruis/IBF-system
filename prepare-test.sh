#!/bin/bash

function prepare() {
  echo 'Running prepare test.'
  echo 'Running docker-compose up -d ibf-api-service ibf-dashboard ibf-local-db'
  docker-compose up -d
  echo 'docker ps -a'
  docker ps -a
  echo 'Running database migration'
  migrate_database
  echo 'Running seed'
  docker-compose exec ibf-api-service npm run seed
}


function migrate_database() {
    declare -a arr=("IBF-static-input")

    for SCHEMA in "${arr[@]}"
    do
        echo "$SCHEMA"
        rm -f tools/db-dumps/ibf_$SCHEMA.dump
        echo pg_dump -U $DB_USERNAME_TEST_VM -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h $DB_HOST_TEST_VM -n \"$SCHEMA\" geonode_datav3
        PGPASSWORD=$DB_PASSWORD_TEST_VM pg_dump -U $DB_USERNAME_TEST_VM -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h $DB_HOST_TEST_VM -n \"$SCHEMA\" geonode_datav3
        echo psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST_LOCAL -p $DB_PORT_LOCAL -c 'drop schema "'$SCHEMA'" cascade; create schema "'$SCHEMA'";'
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST_LOCAL -p $DB_PORT_LOCAL -c 'drop schema "'$SCHEMA'" cascade; create schema "'$SCHEMA'";'
        echo  pg_restore -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST_LOCAL -p $DB_PORT_LOCAL --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
        PGPASSWORD=$DB_PASSWORD pg_restore -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST_LOCAL -p $DB_PORT_LOCAL --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
    done
}

prepare