import '../support/test-functions';

const COUNTRY_NAME = 'ZAMBIA';
const COUNTRY_EMAIL = 'zambia@redcross.nl';

describe(`${COUNTRY_NAME} test`, () => {
  beforeEach(() => {
    cy.login(COUNTRY_EMAIL);
  });

  it(`Loop over disasters and test timeline button`, () => {
    cy.timelineTest(COUNTRY_NAME);
  });
});
