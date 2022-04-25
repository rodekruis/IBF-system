import selectors from '../../support/selectors';

describe('timeline component', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should load at least 1 timeline button', () => {
    cy.get(selectors.timeline.timelineButton).should('be.visible');
  });

  it('should load at least 1 active timeline button', () => {
    cy.get(selectors.timeline.timelineButtonActive).should('be.visible');
  });

  it('should load at least 1 triggered button IF dashboard in triggered state');

  it('should load 0 triggered button IF dashboard in non-triggered state');

  it('click on active timeline button', () => {
    cy.get(selectors.timeline.timelineButtonActive).as('Activebutton');
    cy.get('@Activebutton').then(($button) => {
      cy.wrap($button).should('be.visible').should('not.be.disabled').click();
    });
  });
});
