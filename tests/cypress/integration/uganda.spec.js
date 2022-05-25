import '../support/test-functions';

const COUNTRY_NAME = 'UGANDA';
const COUNTRY_EMAIL = 'uganda@redcross.nl';

describe(`${COUNTRY_NAME} test`, () => {
  beforeEach(() => {
    cy.login(COUNTRY_EMAIL);
  });

  it(`Loop over disasters and test timeline button`, () => {
    cy.timelineTest(COUNTRY_NAME);
  });
});
