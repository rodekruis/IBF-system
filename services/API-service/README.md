# API-service

This service creates endpoints which serves data from the IBF-database to (for example) the IBF-dashboards.

---

## Getting started / Installation

Clone the repository

Switch to the repository folder

    cd services/API-service/

Set the environment variables with the right values from someone who knows:

    cp example.env .env
    source .env

## Start application locally

Create the Docker image from the Dockerfile in this folder through:

    docker build -t ibf-api-service .

Start the app Docker container through:

    docker run --name=ibf-api-service -p 3000:3000 -it ibf-api-service

If you've already created the container before and just want to start again:

    docker start -i ibf-api-service

The Docker container currently in development phase does NOT run a `npm start` command.

Run the application through:

- `npm run start:dev` (uses `tswatch` instead of `nodemon`)
- `npm run start:watch` (to use with `nodemon` for restart upon change)

## Start application on VM

Same as above. But replace `-it` tag in `docker run` or `docker start` commands by `-d` to run in detached mode.
Also, the CMD line of Dockerfile should be changed from: `CMD ["npm", "run", "start:dev"]` to `CMD ["npm", "start"]`.

## How to use Swagger (with authorization features)

Access Swagger API via `http://localhost:3000/docs`

### Sign-up/Sign-in

- If you have no users in your database yet, start with 'USER /POST user'. Leave the default input as is, and execute.
- If you already have created the above user earlier, start with 'USER /POST user/login'. Leave the default input as is, and execute.
- In either case, copy the value of the Token-attribute from the output.
- Click 'Authorize' (top-right) and fill in `Bearer <copied token>`
- This will now give you access to all hitherto forbidden API-calls.
- NOTE: for ease of development, if not logged in, it will take the default-user. So you do need to create this default user with email `test@example.org`, but the Authorize part is not necessary any more. Otherwise you would need to repeat the Authorize-setup after each refresh of Swagger, i.e. after each code change.

## Other relevant NPM scripts

- `npm start` - Start application
- `npm run start:watch` - Start application in watch mode
- `npm run test` - run Jest test runner
- `npm run start:prod` - Build application

---

## Authentication

This applications uses [JSON Web Token](https://jwt.io/) (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.

---

## Swagger API docs

We use the NestJS swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [swagger.io](https://swagger.io/)

## API specification

- /stations/:countryCode/:currentPrev/:leadTime
  - input:
    - countryCode [ZMB] > currently not used, as data is ZMB-only. Will need to change when working with multi-country datamodel
    - currentPrev ['Current', 'Prev'] > represents today/yesterdays forecast. For testing always use 'Current'.
    - leadTime ['3-day', '7-day'] > represents whether a trigger is forecasted 3 / 7 days from now.
  - output:
    - stationCode
    - stationName
    - geom (coordinates)
    - trigger_level > water-discharge level above which flood is predicted
    - fc > avg forecasted water-discharge level
    - fc_trigger [0, 1] > is trigger passed yes or no. can theoretically differ from fc > trigger_level, because actually 51 ensembles are run. fc_trigger = 1 if at least 60% of these 51 ensembles exceed trigger
    - fc_perc > = fc / trigger_level
    - fc_prob > percentage of 51 ensembles that exceeded trigger-level
