FROM node:15-alpine

RUN apk update && apk add python make g++ git

RUN mkdir --parents /home/ibf/api-service/node_modules && chown -R node:node /home/ibf/api-service

WORKDIR /home/ibf/api-service/

# Install dependencies
COPY package*.json ./

USER node

RUN npm ci --no-audit

# Prepare configurations
COPY --chown=node:node . .

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

CMD ["npm", "start"]
