import selectors from '../../support/selectors';

describe('timeline component', () => {
  it('should login', () => {
    cy.login();
  });

  it('should load at least 1 active (enabled) timeline button', () => {
    cy.get(selectors.timeline.timelineButton).should('not.be.disabled');
  });

  it('should load a triggered button if and only if the dashboard is in triggered state', () => {
    cy.isStatusTriggered().then((triggered) => {
      triggered
        ? cy.get(`${selectors.timeline.timelineButton}.alert`)
        : cy
            .get(`${selectors.timeline.timelineButton}.alert`)
            .should('not.exist');
    });
  });

  it('should have only 1 selected button', () => {
    cy.get(`${selectors.timeline.timelineButton}.active`).should(
      'have.length',
      1,
    );
  });
});
