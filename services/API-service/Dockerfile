FROM node:10-alpine

RUN apk update && apk add python make g++ git

RUN mkdir --parents /home/ibf/api-service/node_modules && chown -R node:node /home/ibf/api-service

WORKDIR /home/ibf/api-service/

# Install dependencies
COPY package*.json ./

USER node

RUN npm ci

# Prepare configurations
COPY --chown=node:node . .

EXPOSE 3000

ENV DB_TYPE $DB_TYPE
ENV DB_HOST $DB_HOST
ENV DB_PORT $DB_PORT
ENV DB_DATABASE $DB_DATABASE
ENV DB_USERNAME $DB_USERNAME
ENV DB_PASSWORD $DB_PASSWORD
ENV SECRET $SECRET
ENV NODE_ENV $NODE_ENV

CMD ["npm", "start"]
