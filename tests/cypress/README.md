# Integration testing through Cypress

We use Cypress for automated integration testing in this project.

## Installation:

0. Potentially on Ubuntu?:
   `sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb`

1. In root folder `npm install --only=dev`

   - This should download and install Cypress
   - If it fails, find out why and/or install Cypress in some other way (e.g.
     `npm install cypress`)

2. Set necessary environment variables by copying `cypress.env.json.example` to `cypress.env.json` and filling in the variables.

3. Run `npm run cypress:open`

   - When the Cypress window opens click on 'Run X integration specs'
   - Alternatively run `npm run cypress:start` to run from commandline

## Testing on test-VM

- The Cypress tests are automatically run on ibf-test after every deploy there, as part of the `deploy.sh` script.
- It does not run on other servers because of a check on `[[ $NODE_ENV="test" ]]`
- Env-vars are stored in the main .env. Currently tests are only executed for the 1st country logged in to with the given user.
- Results are stored in https://dashboard.cypress.io/projects/jkaw7k/runs
- And a badge of the latest test run is always shown in the [main README](../../README.md)

## Testing setup

The primary objective of integration testing is to automatically test beyond the limited scope of the dev-item that is worked on. That generally focusses on one country, one disaster-type, one triggered-state, which leaves room for things going wrong in other places.

This means that every tests should ideally be executed across

- All countries
  - Achieved by having a test file per country.
    Every file contains the country manager email for login, and calls common testing functions defined (for the moment) in [test-functions.js](./support/test-functions.js)
- All disaster-types per country
  - Currently implemented for timeline-component only
- Both triggered and non-triggered state for each disaster-type
  - Not currently implemented
  - Can be achieved by simulating mock scenario
