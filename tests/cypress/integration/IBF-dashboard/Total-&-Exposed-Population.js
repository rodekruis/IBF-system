import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Total & Exposed Population Test
describe("Total & Exposed Population", () => {
    beforeEach(() => {
        cy.login();
        
    });
    
   it("loads Total & exposed population", () => {
       cy.xpath(selectors.TotalPopulationName)
        .should('be.visible')
        .should("have.text", constants.TotalPopulationText);
        

        cy.xpath(selectors.ExposedPopulationName)
        .should('be.visible')
        .should("have.text", constants.ExposedPopulationText);
        ;
         
      });
      it("display Total & exposed population name", () => {
        cy.xpath(selectors.TotalPopulationName)
            .should("be.visible")
            .invoke("text")
            .should("not.be.empty");
            cy.xpath(selectors.ExposedPopulationName)
            .should("be.visible")
            .invoke("text")
            .should("not.be.empty");  

    });

    it("display No. of Total & exposed population", () => {
       cy.xpath(selectors.exposedPopulationNumber)
            .should("be.visible").invoke("text")
            .should("not.be.empty");

       cy.xpath(selectors.TotalPopulationNumber)
        .should("be.visible").invoke("text")
        .should("not.be.empty");

    });
 
});


