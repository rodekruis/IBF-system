import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Aggregate Component Test
describe("Aggregate Component Test", () => {
    beforeEach(() => {
        cy.login();     
    });   

    it("loads and print aggregate title", () => {

      cy.get(selectors.aggregateTitle)
      .should("be.visible").invoke("text")
      .should("not.be.empty");

     });

   it("loads Total Population & exposed population", () => {
       cy.get(selectors.aggregateList)
        .should('be.visible')
        .should("not.be.disabled");

        cy.get(selectors.aggregateNumber)
        .should('be.visible')
       .should("not.be.disabled");
      });

      it("Print Total Population & exposed population text", () => {
        cy.get(selectors.aggregateList).as("rows");
        cy.get("@rows").then(($row)=>{
            cy.wrap($row).contains(constants.ExposedPopulationText).invoke('text').should('not.be.empty')
            cy.wrap($row).contains(constants.TotalPopulationText).invoke('text').should('not.be.empty')
          })
        });

    it("load and print No. of Total Population & exposed population", () => {
       cy.get(selectors.ExposedaggregateNumber)
            .should("be.visible").invoke("text")
            .should("not.be.empty");
       cy.get(selectors.TotalaggregateNumber)
        .should("be.visible").invoke("text")
        .should("not.be.empty")
    })

    it("Print Cattle Exposed & Small Ruminants text", () => {
      cy.get(selectors.aggregateList).as("rows");
      cy.get("@rows").then(($row)=>{
          cy.wrap($row).contains(constants.CattleExposedText).invoke('text').should('not.be.empty')
          cy.wrap($row).contains(constants.SmallRuminantsText).invoke('text').should('not.be.empty')
        })
      });

  it("load and print No. of Cattle Exposed & Small Ruminants", () => {
     cy.get(selectors.CattleExposedNumber)
          .should("be.visible").invoke("text")
          .should("not.be.empty");
     cy.get(selectors.SamllRuminantNumber)
      .should("be.visible").invoke("text")
      .should("not.be.empty")
  })
    it("loads and click Aggregate Popup Message", () => {  
      cy.get(selectors.AggregatePopupicon).should("be.visible").click();     
     }); 

     
});
