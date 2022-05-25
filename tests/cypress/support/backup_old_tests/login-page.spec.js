import selectors from '../../support/selectors';
import constants from '../../support/constants';

// test login
describe('Login Page', () => {
  beforeEach(() => {
    cy.visit(constants.loginPagePath);
  });

  it('loads', () => {
    cy.url().should((url) => {
      expect(url).to.match(
        new RegExp(
          '^' + Cypress.config().baseUrl + constants.loginPagePath + '$',
        ),
      );
      expect(localStorage.getItem(constants.loginToken)).not.to.exist;
    });

    cy.get(selectors.inputUser).should('be.visible').should('be.enabled');

    cy.get(selectors.inputPassword).should('be.visible').should('be.enabled');

    cy.get(selectors.inputSubmit)
      .should('be.visible')
      .should('not.be.disabled');
  });

  it('allows login', () => {
    cy.get(selectors.inputUser).type(Cypress.env(constants.envLoginUser));
    cy.get(selectors.inputPassword).type(
      Cypress.env(constants.envLoginPassword),
    );
    cy.get(selectors.inputSubmit).click();

    cy.url().should((url) => {
      expect(url).to.match(
        new RegExp(
          '^' + Cypress.config().baseUrl + constants.dashboardPagePath + '$',
        ),
      );
      expect(localStorage.getItem(constants.loginToken)).to.exist;
    });
  });
});
