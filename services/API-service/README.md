# IBF-API-service: REST API of the IBF-system

This service creates endpoints which serves data from the IBF-database to (for example) the IBF-interfaces.

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

## Documentation

We use [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) for documentation. An example is explained in the [documentation guide](./DOCUMENATION.md).
