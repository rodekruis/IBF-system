import selectors from "../../support/selectors";
import constants from "../../support/constants";

// test logos
describe("Logos", () => {
    beforeEach(() => {
        cy.login();
    });

    it("loads", () => {
        cy.get(selectors.logoImage)
            .should("be.visible")
            .should("have.attr", "src");
    });
});
