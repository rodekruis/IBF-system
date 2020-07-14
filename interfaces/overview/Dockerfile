FROM node:10-alpine

RUN apk update && apk add python make g++ git

RUN mkdir -p /home/node/app/node_modules && mkdir -p /home/node/app/www && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

EXPOSE 4200

ENV NG_PRODUCTION $NG_PRODUCTION
ENV NG_API_URL $NG_API_URL
ENV NG_USE_MOCK_DATA $NG_USE_MOCK_DATA
ENV NG_USE_SERVICE_WORKER $NG_USE_SERVICE_WORKER
ENV NG_DEFAULT_COUNTRY_CODE $NG_DEFAULT_COUNTRY_CODE
ENV NG_INITIAL_LAT $NG_INITIAL_LAT
ENV NG_INITIAL_LNG $NG_INITIAL_LNG

RUN npm run build -- --prod
