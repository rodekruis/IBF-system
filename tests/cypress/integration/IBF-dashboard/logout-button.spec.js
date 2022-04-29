import selectors from '../../support/selectors';
import constants from '../../support/constants';

// test logout button
describe('Logout Button', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads', () => {
    cy.get(selectors.logOut).should('be.visible').should('not.be.disabled');
  });

  it('logs out', () => {
    cy.get(selectors.logOut).click();
    cy.url().should((url) => {
      expect(url).to.match(
        new RegExp(
          '^' + Cypress.config().baseUrl + constants.loginPagePath + '$',
        ),
      );
      expect(localStorage.getItem(constants.loginToken)).not.to.exist;
    });
  });
});
