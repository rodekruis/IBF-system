#!/bin/bash

function deploy() {
    # Ensure we always start from the repository root-folder
    local repo
    repo=$(git rev-parse --show-toplevel)
    cd "$repo" || return

    # Arguments
    local target=$1 || false

    function log() {
        printf "\n\n"
        # highlight/warn:
        tput setaf 3
        echo "$@"
        printf "\n"
        # reset highlight/warn:
        tput sgr0
    }

    function update_code() {
        log "Updating code..."
        local target=$1 || false

        cd "$repo" || return
        git reset --hard
        git fetch --all --tags

        # When a target is provided, checkout that
        if [[ -n "$target" ]]
        then
            log "Checking out: $target"
            git checkout "$target"
        else
            log "Pulling latest changes"
            git checkout master
            git pull --ff-only
        fi
    }

    function load_environment_variables() {
        log "Loading environment variables..."
        set -a; [ -f ./.env ] && . ./.env; set +a;
        export NG_IBF_SYSTEM_VERSION=v$(node -p "require('./package.json').version")
        log echo "NODE_ENV: $NODE_ENV"
        log echo "NG_CONFIGURATION: $NG_CONFIGURATION"
        log echo "NG_IBF_SYSTEM_VERSION: $NG_IBF_SYSTEM_VERSION"
    }

    function updating_containers() {
        log "Updating containers..."

        cd "$repo" || return
        docker-compose down -v
        docker-compose --env-file /dev/null config > inspect.docker-compose.config
        docker-compose --env-file /dev/null -f docker-compose.yml up -d --build
        docker-compose --env-file /dev/null restart
    }

    function migrate_database() {
        log "Migrating database..."

        declare -a arr=("IBF-static-input")

        for SCHEMA in "${arr[@]}"
        do
            echo "$SCHEMA"
            rm -f tools/db-dumps/ibf_$SCHEMA.dump
            PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USERNAME -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h $DB_HOST -n \"$SCHEMA\" geonode_datav3
            PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST -c 'drop schema "'$SCHEMA'" cascade; create schema "'$SCHEMA'";'
            PGPASSWORD=$DB_PASSWORD pg_restore -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
        done

        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_DATABASE -h $DB_HOST -f $SQL_FILE_PATH

    }

    function restart_webhook_service() {
        sudo systemctl daemon-reload
        sudo service webhook restart

        log "Webhook service restarted: "
    }

    function cleanup_docker() {
        docker image prune -f

        log "Unused Docker images removed: "
    }


    #
    # Actual deployment:
    #
    update_code "$target"

    load_environment_variables

    updating_containers

    migrate_database

    restart_webhook_service

    cleanup_docker

    log "Done."
}

deploy "$@"
