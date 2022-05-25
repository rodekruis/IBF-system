import selectors from '../../support/selectors';

// Chat component
describe('Chat component', () => {
  beforeEach(() => {
    cy.login();
  });

  it('load and validate intro messages and followup messages', () => {
    cy.get(selectors.chat)
      .should('be.visible')
      .invoke('text')
      .should('not.be.empty');
  });

  it('loads VideoGuide button', () => {
    cy.get(selectors.videoGuidebutton)
      .should('be.visible')
      .should('not.be.disabled');
  });

  it('click and close video guide button', () => {
    cy.get(selectors.videoGuidebutton).click();
    cy.get(selectors.videoGuideclosebutton).click();
  });

  it('validate About Trigger ', () => {
    cy.get(selectors.AboutTrigger)
      .should('be.visible')
      .should('not.be.disabled');
  });
});
