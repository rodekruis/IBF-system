import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Map Test
describe("Map Overview", () => {
    beforeEach(() => {
        cy.login();
        
});

    it("loads map", () => { 
    cy.get(selectors.mapoverview).should("be.visible")
            .should("not.be.disabled")
     })

});