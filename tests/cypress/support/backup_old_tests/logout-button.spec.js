import selectors from '../../support/selectors';
import constants from '../../support/constants';

// test logout button
describe('Logout Button', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads', () => {
    cy.waitForLogoutButton();
  });

  it('logs out', () => {
    cy.waitForLogoutButton();
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
