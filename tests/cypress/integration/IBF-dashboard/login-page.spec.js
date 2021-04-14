import selectors from "../../support/selectors";
import constants from "../../support/constants";

// test login.page behaviour
describe("Login Page", () => {
    beforeEach(() => {
        cy.visit(constants.loginPagePath);
    });

    it("loads", function () {
        cy.url().should(url => {
            expect(url).to.match(
                new RegExp(
                    "^" +
                        Cypress.config().baseUrl +
                        constants.loginPagePath +
                        "$"
                )
            );
            expect(localStorage.getItem(constants.loginToken)).not.to.exist;
        });

        cy.get(selectors.pageTitle).should(element => {
            expect(element).to.be.visible;
            expect(element).to.contain(constants.loginPageTitle);
        });

        cy.get(selectors.inputUser).should(element => {
            expect(element).to.be.visible;
            expect(element).to.be.enabled;
        });

        cy.get(selectors.inputPassword).should(element => {
            expect(element).to.be.visible;
            expect(element).to.be.enabled;
        });

        cy.get(selectors.inputSubmit).should(element => {
            expect(element).to.be.visible;
            expect(element).not.to.be.enabled;
        });
    });

    it("allows login", function () {
        cy.get(selectors.inputUser).type(Cypress.env(constants.envLoginUser));
        cy.get(selectors.inputPassword).type(
            Cypress.env(constants.envLoginPassword)
        );
        cy.get(selectors.inputSubmit).click();

        cy.url().should(url => {
            expect(url).to.match(
                new RegExp(
                    "^" +
                        Cypress.config().baseUrl +
                        constants.dashboardPagePath +
                        "$"
                )
            );
            expect(localStorage.getItem(constants.loginToken)).to.exist;
        });

        // move to dashboard page
        cy.get(selectors.loggedInAs).should(element => {
            expect(element).to.be.visible;
            expect(element).contain(constants.loggedInAs);
        });
    });
});
