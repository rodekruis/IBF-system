# Integration testing through Cypress

## Using Cypress

See [main README](../../README.md) for instructions to use

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

    Every file contains the country manager email for login, and calls common testing functions defined (for the moment) in [test-functions.js](./support/test-functions.js).

  - When a new country is added a new `<country>.spec.ts` should be created, containing the same code as the other country files.

- All disaster-types per country

  - Currently implemented for timeline-component only.

    The timeline-component function iterates through disaster-type buttons and performs the test.

    `EXCEPTION`: test on PHL typhoon won't run for now because it times out and prevents other countries' tests to run. It is skipped by using the following code:

    ```
    if (countryName === 'PHILIPPINES' && index === 2) {
      return;
    }
    ```

    Please check and adjust this code if a new disaster type is added to PHL.

- Both triggered and non-triggered state for each disaster-type
  - Not currently implemented
  - Can be achieved by simulating mock scenario
