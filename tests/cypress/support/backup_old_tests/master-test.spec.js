import selectors from '../selectors';

const timelineTest = (index, iso3Code) => {
  if (iso3Code === 'ETH' && index === 2) {
    return;
  }
  if (index > 0) {
    cy.get(selectors.disasterType.disasterTypeButtons).eq(index).click();
  }
  cy.waitForRequests();

  // should load at least 1 active (enabled) timeline button
  cy.get(selectors.timeline.timelineButton).should('not.be.disabled');

  // should load a triggered button if and only if the dashboard is in triggered state
  cy.isStatusTriggered().then((triggered) => {
    triggered
      ? cy.get(`${selectors.timeline.timelineButton}.alert`).should('exist')
      : cy
          .get(`${selectors.timeline.timelineButton}.alert`)
          .should('not.exist');
  });

  // should have only 1 selected button
  cy.get(`${selectors.timeline.timelineButton}.active`).should(
    'have.length',
    1,
  );
};

const testCountry = ({ iso3Code, email }) => {
  describe(`${iso3Code} test`, () => {
    beforeEach(() => {
      cy.login(email);
    });

    it(`Loop over disasters and test timeline button`, () => {
      cy.waitForRequests();

      cy.get(selectors.disasterType.disasterTypeButtons).then((buttons) => {
        for (let i = 0; i < buttons.length; i++) {
          timelineTest(i, iso3Code);
        }
      });
      cy.waitForLogoutButton();
      cy.get(selectors.logOut).click();
    });
  });
};

describe('Loop through countries', () => {
  const countries = [
    { iso3Code: 'EGY', email: 'egypt@redcross.nl' },
    { iso3Code: 'ETH', email: 'ethiopia@redcross.nl' },
    { iso3Code: 'KEN', email: 'kenya@redcross.nl' },
    { iso3Code: 'PHL', email: 'philippines@redcross.nl' },
    { iso3Code: 'UGA', email: 'uganda@redcross.nl' },
    { iso3Code: 'ZMB', email: 'zambia@redcross.nl' },
    { iso3Code: 'ZWE', email: 'zimbabwe@redcross.nl' },
  ];

  countries.forEach((country) => {
    testCountry(country);
  });
});
