import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Action Summary Test
describe("Action Summary Test", () => {
    beforeEach(() => {
        cy.login();     
    });   

    it("loads and print Action Summary title", () => {

      cy.get(selectors.ActionSummaryTitle)
      .should("be.visible").invoke("text")
      .should("not.be.empty");

    });

    it(" verify and validate Action Summary lists ", () => { 

      cy.get(selectors.ActionSummarytype).as("actions")
      cy.get("@actions").then(($actions)=>{
            
              cy.wrap($actions).contains(' Disaster Risk Reduction ').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('Shelter').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('Livelihoods & Basic Needs').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('Health').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('WASH').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('Inclusion, Gender & Protection').invoke('text').should('not.be.empty')
              cy.wrap($actions).contains('Migration').invoke('text').should('not.be.empty')
             
         })
 
     
      })

    it("validate and print Action Summary orverview", () => {

      cy.get(selectors.ActionSummarytype)
      .should("be.visible").invoke("text")
      .should("not.be.empty");

     });

    });