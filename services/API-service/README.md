# IBF-API-service: REST API of the IBF-system

This service creates endpoints which serves data from the IBF-database to (for example) the IBF-interfaces.

---

## Getting started / Installation

Clone the repository

Switch to the repository folder

    cd services/API-service/

## Start application locally

Create the Docker image from the Dockerfile in this folder through:

    docker build -t ibf-api-service .

Start the app Docker container through:

    docker run --name=ibf-api-service -p 3000:3000 -it ibf-api-service

If you've already created the container before and just want to start again:

    docker start -i ibf-api-service

The Docker container currently in development phase does NOT run a `npm start` command.

Run the application through:

- `npm run start:dev` (uses `tswatch` for restart upon change)

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
- `npm run start:dev` - Start application in watch mode
- `npm run test` - run Jest test runner
- `npm run start:prod` - Build application

---

## Authentication

This applications uses [JSON Web Token](https://jwt.io/) (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.

---

## Documentation

We use [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) for documentation. An example is explained in the [documentation guide](./DOCUMENATION.md).

## Migration scripts

We use TypeORM migrations to handle changes to the datamodel. This means that developers need to generate migration-files locally upon datamodel changes, which are subsequently (automatically) run before the API-service starts in another environment (both remote server and local environment of other developer).

Developers use the following process for this.

1. The attribute 'synchronize' in ormconfig.js is set to 'false' by default. This means that any changes in your entities in code are not automatically reflected in the datamodel.
2. Otherwise TypeORM's migration:generate functionality cannot be used to automatically capture the difference between before (datamodel) and after (entities) state.
3. A developer develops + tests until running into a datamodel change. If that happens
   - Generate a migration through `docker-compose exec ibf-api-service npm run migration:generate <MigrationName>`
   - Immediately run the migration (by restarting ibf-api-service, as migration:run is run upon 'prestart')
   - Test the feature
   - Continue developing and repeat this process as many times as needed
4. If - because of trial and error - the migration in the end turns out to be reverted or amended, it is up to the developer to decide to
   - manually minimize the number of migration-scripts
     - e.g. one migration and its reversal would exactly cancel out, so both can be deleted
     - e.g. a column name change from A to B to C, could be merged to one migration script which renames from A to C
   - or to not do this, as functionally it doesn't matter in the end. This does however 'pollute' the code-base and reduces the overview/readability on migrations.
5. If a developer works on an (e.g. refactor) item that comes with a lot of datamodel changes, it is up to the developer to alternatively go for an approach
   - where 'synchronize' is temporariliy changed to 'true', so that changes are immediately reflected, which allows for quicker development
   - when a chunk of work is finished, the migration-script can be generated afterwards by
     - stashing changes
     - switching to different branch
     - setting synchronize to false again
     - populating stashed changes
     - generating migration-script
   - Keep in mind here that we want to keep migration scripts readable. So do not follow this process only once at the very end, but do it after every demarcated chunk of work.

## Twilio setup

### Test sending WhatsApp message from local API with Twilio WhatsApp sandbox

First basic setup:

- In Twilio 'IBF-platform' account, create a subaccount per country.
- In Twilio Create a messaging service
- In local .env update from the above
  - `TWILIO_SID`
  - `TWILIO_AUTHTOKEN`
  - `TWILIO_MESSAGING_SID`
- and update `TWILIO_WHATSAPP_NUMBER` = +14155238886 (the standard Twilio whatsapp sandbox number)

Use [ngrok](https://ngrok.com/) to mock an external API service:

1. Sign up on [ngrok](https://ngrok.com/) using your GitHub account
2. [Download](https://ngrok.com/download) the executable
3. Add the folder to the system environment variables
4. Add the `authtoken` using the command provided in the download page\
   `ngrok config add-authtoken <token>`
5. Run `ngrok` on port 3000\
   `ngrok http 3000`
6. You can find the URL of your API in the `Forwarding` field. Copy this:
   - As value for the `EXTERNAL_API_SERVICE_URL` field in the `.env` file in the root folder
   - In the `WhatsApp sandbox settings` of the Twilio subaccount (Develop > Messaging > Settings > Whatsapp sandbox settings) as:
     - `<EXTERNAL_API_SERVICE_URL>//api/notifications/whatsapp/incoming` in the `WHEN A MESSAGE COMES IN` field
     - `<EXTERNAL_API_SERVICE_URL>//api/notifications/whatsapp/status` in the `STATUS CALLBACK URL` field
7. Rebuild the service with `docker-compose -d up ibf-api-service`
8. Add your WhatsApp phone number to the WhatsApp sandbox by texting the code provided in the subaccount to the sandbox phone number
9. Create a new IBF-user through API with your WhatsApp phone number and assigned to the country you are testing for
10. Send a notification (for a country/disasterType with an active trigger) via the `/api/notification/send` endpoint.

### Test sending WhatsApp message from test-vm API with Twilio WhatsApp sandbox

1. Update the Twilio subaccount settings:

   - In the `WhatsApp sandbox settings` of the Twilio subaccount (Develop > Messaging > Settings > Whatsapp sandbox settings) as:
   - `https://ibf-test.510.global/api/notifications/whatsapp/incoming` in the `WHEN A MESSAGE COMES IN` field
   - `https://ibf-test.510.global/api/notifications/whatsapp/status` in the `STATUS CALLBACK URL` field

2. Create a new IBF-user through API with your WhatsApp phone number and assigned to the country you are testing for
3. Send a notification (for a country/disasterType with an active trigger) via the `/api/notification/send` endpoint
