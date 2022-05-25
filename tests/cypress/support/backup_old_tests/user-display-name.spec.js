import selectors from '../../support/selectors';
import constants from '../../support/constants';

// test user display name
describe('User Display Name', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads label', () => {
    cy.get(selectors.userDisplayNameLabel)
      .should('be.visible')
      .should('have.text', constants.userDisplayNameLabelText);
  });

  it('loads name', () => {
    cy.get(selectors.userDisplayName)
      .should('be.visible')
      .invoke('text')
      .should('not.be.empty');
  });
});
