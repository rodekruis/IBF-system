import selectors from "../../support/selectors";
import constants from "../../support/constants";

// test export button
describe("Export Button", () => {
    beforeEach(() => {
        cy.login();
    });

    it("loads", () => {
        cy.get(selectors.exportViewButton)
            .should("be.visible")
            .should("not.be.disabled");
    });

    it("opens popup", () => {
        cy.get(selectors.exportViewButton).click();
        cy.waitForAngular();
        cy.get(selectors.exportViewPopover).should("be.visible");
    });
});
