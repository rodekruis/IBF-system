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
        log "Update code..."
        local target=$1 || false

        cd "$repo" || return
        git reset --hard
        git fetch --all --tags

        # When a target is provided, checkout that
        if [[ -n "$target" ]]
        then
            log "Check out: $target"
            git checkout "$target"
        else
            log "Pull latest changes"
            git checkout master
            git pull --ff-only
        fi
    }

    function load_environment_variables() {
        log "Load environment variables..."
        set -a; [ -f ./.env ] && . ./.env; set +a;
        export NG_IBF_SYSTEM_VERSION=v$(node -p "require('./package.json').version")
        log echo "NODE_ENV: $NODE_ENV"
        log echo "NG_CONFIGURATION: $NG_CONFIGURATION"
        log echo "NG_IBF_SYSTEM_VERSION: $NG_IBF_SYSTEM_VERSION"
    }

    function update_containers() {
        log "Update containers..."

        cd "$repo" || return
        docker-compose down -v
        docker-compose --env-file /dev/null config > inspect.docker-compose.config
        docker-compose --env-file /dev/null -f docker-compose.yml up -d --build
        docker-compose --env-file /dev/null restart
    }

    function migrate_database() {
        if [ "$PRODUCTION_DATA_SERVER" = no ]; then
            log "Migrate database..."

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
        fi

    }

    function restart_webhook_service() {
        log "Restart webhook service..."

        sudo systemctl daemon-reload
        sudo service webhook restart
    }

    function cleanup_docker() {
        log "Remove unused docker images..."

        docker image prune -f
    }

    function test_lighthouse() {
        if [[ $NODE_ENV="test" ]]
        then
            log "Run lighthouse test on $NODE_ENV environment..."
            lhci autorun --config=tests/lighthouse/lighthouserc.js
        else
            log "Skip lighthouse test on $NODE_ENV environment..."
        fi
    }

    update_code "$target"

    load_environment_variables

    update_containers

    migrate_database

    cleanup_docker

    test_lighthouse

    restart_webhook_service

    log "Done."
}

deploy "$@"
