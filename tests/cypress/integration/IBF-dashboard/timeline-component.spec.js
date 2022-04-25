import selectors from '../../support/selectors';

describe('timeline component', () => {
  it('should login', () => {
    cy.login();
  });

  // Tests for 1st disaster-type
  it('DISASTER TYPE 1: should load at least 1 active (enabled) timeline button', () => {
    cy.get(selectors.timeline.timelineButton).should('not.be.disabled');
  });

  it('DISASTER TYPE 1: should load a triggered button if and only if the dashboard is in triggered state', () => {
    cy.isStatusTriggered().then((triggered) => {
      triggered
        ? cy.get(`${selectors.timeline.timelineButton}.alert`)
        : cy
            .get(`${selectors.timeline.timelineButton}.alert`)
            .should('not.exist');
    });
  });

  it('DISASTER TYPE 1: should have only 1 selected button', () => {
    cy.get(`${selectors.timeline.timelineButton}.active`).should(
      'have.length',
      1,
    );
  });

  // click 2nd disaster-type
  it('click on 2nd disaster-type', () => {
    cy.get(selectors.disasterType.disasterTypeButtons).eq(1).click();
  });

  // Tests for 2nd disaster-type
  it('DISASTER TYPE 2: should load at least 1 active (enabled) timeline button', () => {
    cy.get(selectors.timeline.timelineButton).should('not.be.disabled');
  });

  it('DISASTER TYPE 2: should load a triggered button if and only if the dashboard is in triggered state', () => {
    cy.isStatusTriggered().then((triggered) => {
      triggered
        ? cy.get(`${selectors.timeline.timelineButton}.alert`).should('exist')
        : cy
            .get(`${selectors.timeline.timelineButton}.alert`)
            .should('not.exist');
    });
  });

  it('DISASTER TYPE 2: should have only 1 selected button', () => {
    cy.get(`${selectors.timeline.timelineButton}.active`).should(
      'have.length',
      1,
    );
  });
});
