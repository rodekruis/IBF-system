# Integration testing through Cypress

## Using Cypress

See [main README](../../README.md) for instructions to use

## Testing on test-VM

- The Cypress tests are automatically run on ibf-test after every deploy there, as part of the `deploy.sh` script.
- It does not run on other servers because of a check on `[[ $NODE_ENV="test" ]]`
- Env-vars are stored in the main .env. Currently tests are only executed for the 1st country logged in to with the given user.
- results are stored in https://dashboard.cypress.io/projects/jkaw7k/runs
- and a badge of the latest test run is always shown in the [main README](../../README.md)

## Testing setup

The primary objective of integration testing is to automatically test beyond the limited scope of the dev-item that is worked on. That generally focusses on one country, one disaster-type, one triggered-state, which leaves room for things going wrong in other places.

This means that every tests should ideally be executed across

- all countries
  - not currently implemented
  - can be achieved by logging in as admin, and using the country-switcher
  - or by logging in with different country-users
- all disaster-types per country
  - currently implemented for timeline-component only
- both triggered and non-triggered state for each disaster-type
  - not currently implemented
  - can be achieved by simulating mock scenario
