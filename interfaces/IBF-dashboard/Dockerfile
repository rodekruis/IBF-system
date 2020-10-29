FROM node:10-alpine

RUN apk update && apk add python make g++ git

RUN mkdir -p /home/node/app/node_modules && mkdir -p /home/node/app/www && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

EXPOSE 4200

ARG NG_PRODUCTION
ENV NG_PRODUCTION=$NG_PRODUCTION

ARG NG_API_URL
ENV NG_API_URL=$NG_API_URL

ARG NG_USE_SERVICE_WORKER
ENV NG_USE_SERVICE_WORKER=$NG_USE_SERVICE_WORKER

ARG NG_GEOSERVER_URL
ENV NG_GEOSERVER_URL=$NG_GEOSERVER_URL

RUN npm run build -- --prod
