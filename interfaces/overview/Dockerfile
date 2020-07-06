FROM node:10-alpine

RUN apk update && apk add python make g++ git

RUN mkdir -p /home/node/app/node_modules && mkdir -p /home/node/app/www && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

EXPOSE 4200

RUN npm run build -- --prod
