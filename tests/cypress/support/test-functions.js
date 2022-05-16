import selectors from './selectors';

Cypress.Commands.add('timelineTest', (countryName) => {
  cy.waitForRequests();

  cy.get(selectors.disasterType.disasterTypeButtons).then((buttons) => {
    for (let index = 0; index < buttons.length; index++) {
      if (countryName === 'PHILIPPINES' && index === 2) {
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
    }
  });

  cy.get(selectors.logOut).click();
});
