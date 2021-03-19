#!/bin/bash

function prepare() {
  cd ../..
  docker-compose up -d
  migrate_database
  docker-compose exec ibf-api-service npm run seed
  cd interfaces/tests/
}


function migrate_database() {
    declare -a arr=("IBF-static-input")

    for SCHEMA in "${arr[@]}"
    do
        echo "$SCHEMA"
        rm -f tools/db-dumps/ibf_$SCHEMA.dump
        PGPASSWORD=$DB_PASSWORD_TEST_VM pg_dump -U $DB_USERNAME_TEST_VM -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h $DB_HOST_TEST_VM -n \"$SCHEMA\" geonode_datav3
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST -p $DB_PORT_LOCAL -c 'drop schema "'$SCHEMA'" cascade; create schema "'$SCHEMA'";'
        PGPASSWORD=$DB_PASSWORD pg_restore -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST -p $DB_PORT_LOCAL --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
    done

    PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST -p $DB_PORT_LOCAL -f $SQL_FILE_PATH
}

prepare