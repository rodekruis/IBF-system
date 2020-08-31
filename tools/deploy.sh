#!/bin/bash

function deploy() {
  # Ensure we always start from the repository root-folder
  local repo
  repo=$(git rev-parse --show-toplevel)
  cd "$repo" || return

  # Load ENV-variables
  set -a; [ -f ./tools/.env ] && . ./tools/.env; set +a;

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
    sudo git reset --hard
    sudo git fetch --all --tags

    # When a target is provided, checkout that
    if [[ -n "$target" ]]
    then
      log "Checking out: $target"

      sudo git checkout -b "$target" --track upstream/"$target"
    else
      log "Pulling latest changes"

      sudo git pull --ff-only
    fi
  }

  function updating_containers() {
    log "Updating containers..."

    cd "$repo" || return
    sudo docker-compose down -v
    sudo docker-compose -f docker-compose.yml up -d --build
    sudo docker-compose restart
  }

  function migrate_database() {
    log "Migrating database..."

    declare -a arr=("IBF-static-input" "IBF-pipeline-output" "IBF-API")

    for i in "${arr[@]}"
    do
      SCHEMA=$i
      echo "$SCHEMA"
      PGPASSWORD=$PGPASSWORD pg_dump -U geonodeadmin@geonode-database -Fc -f tools/db-dumps/ibf_$SCHEMA.dump -h geonode-database.postgres.database.azure.com -n \"$SCHEMA\" geonode_datav3
      PGPASSWORD=$PGPASSWORD pg_restore -U geonodeadmin@geonode-database -d geonode_data -h geonode-database.postgres.database.azure.com --schema=$SCHEMA --clean tools/db-dumps/ibf_$SCHEMA.dump
    done

  }

  function restart_webhook_service() {
    sudo systemctl daemon-reload
    sudo service webhook restart

    log "Webhook service restarted: "
  }


  #
  # Actual deployment:
  #
  update_code "$target"

  updating_containers

  migrate_database

  restart_webhook_service

  log "Done."
}

deploy "$@"
