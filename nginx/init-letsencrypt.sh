#!/bin/bash

if ! [ -x "$(command -v docker-compose)" ]; then
    echo 'Error: docker-compose is not installed.' >&2
    exit 1
fi

domains=(ibf-system.westeurope.cloudapp.azure.com www.ibf-system.westeurope.cloudapp.azure.com)
rsa_key_size=4096
data_path="./certbot"
email="grahman@rodekruis.nl"
docker_compose="docker-compose -f docker-compose.yml"

mkdir -p "$data_path/conf"
mkdir -p "$data_path/www"

# Enable staging mode if needed
if [ "$APPLICATION_ENVIRONMENT" == "staging" ]; then
    staging_arg="--staging";
fi

# Set docker compose config for dev
if [ "$APPLICATION_ENVIRONMENT" == "development" ]; then
    docker_compose="$docker_compose -f docker-compose.override.yml"
fi

if [ -d "$data_path" ]; then
    read -t 10 -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
    echo
    if [ "$decision" == "Y" ] || [ "$decision" == "y" ]; then

        if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
            echo "### Downloading recommended TLS parameters ..."
            curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
            curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
            echo
        fi

        echo "### Creating dummy certificate for $domains ..."
        path="/etc/letsencrypt/live/$domains"
        mkdir -p "$data_path/conf/live/$domains"
        $docker_compose run --rm --entrypoint "openssl req -x509 -nodes \
        -newkey rsa:$rsa_key_size -days 1 -subj '/CN=localhost' \
        -keyout '$path/privkey.pem' -out '$path/fullchain.pem'" certbot
        echo

        if [ "$APPLICATION_ENVIRONMENT" == "production" ] || [ "$APPLICATION_ENVIRONMENT" == "staging" ]; then

            echo "### Starting nginx ..."
            $docker_compose up --force-recreate -d nginx
            echo

            echo "### Deleting dummy certificate for $domains ..."
            $docker_compose run --rm --entrypoint "\
            rm -Rf /etc/letsencrypt/live/$domains && \
            rm -Rf /etc/letsencrypt/archive/$domains && \
            rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
            echo


            echo "### Requesting Let's Encrypt certificate for $domains ..."
            #Join $domains to -d args
            domain_args=""
            for domain in "${domains[@]}"; do
                domain_args="$domain_args -d $domain"
            done

            # Select appropriate email arg
            case "$email" in
                "") email_arg="--register-unsafely-without-email" ;;
                *) email_arg="--email $email" ;;
            esac

            $docker_compose run --rm --entrypoint "certbot certonly \
            --webroot -w /var/www/certbot $staging_arg $email_arg $domain_args \
            --rsa-key-size $rsa_key_size --agree-tos --no-eff-email \
            --force-renewal" certbot
            echo

            echo "### Reloading nginx ..."
            $docker_compose exec nginx nginx -s reload

        fi
    fi
fi

echo "### Start certbot for cert renewals ..."
$docker_compose up -d
