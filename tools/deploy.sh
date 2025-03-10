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
        docker compose down -v
        docker compose --env-file /dev/null config > inspect.docker-compose.config
        docker compose --env-file /dev/null -f docker-compose.yml up -d --build
        docker compose --env-file /dev/null restart
        # wait 30 seconds for services to go live
        sleep 30s
    }

    function restart_webhook_service() {
        log "Restart webhook service..."

        sudo systemctl daemon-reload
        sudo service webhook restart
    }

    function cleanup_docker() {
        log "Clean up Docker..."

        docker system prune -f
    }

    function cleanup_dashboard_build() {
        log "Clean up dashboard build..."

        rm -rf "$repo"/interfaces/IBF-dashboard/www/*
    }

    update_code "$target"

    load_environment_variables

    cleanup_docker

    cleanup_dashboard_build

    update_containers

    cleanup_docker

    restart_webhook_service

    log "Done."
}

deploy "$@"
