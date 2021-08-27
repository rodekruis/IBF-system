import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Chat component
describe("Chat component", () => {
    beforeEach(() => {
        cy.login();

    });

    it("loads DisasterType", () => {

         cy.get(selectors.disastertypes).should("be.visible")
        .should("not.be.disabled");
    });
    
    it("validate and print DisasterTypeSelected labels", () => {
        cy.get(selectors.disasterlabel).should("be.visible")
        .invoke("text")
        .should("not.be.empty");
        });

    it("load and validate intro messages and followup messages", () => {
            cy.get(selectors.chat).should("be.visible")
            .invoke("text")
            .should("not.be.empty");
      });


  
    it("loads VideoGuide button", () => {
            cy.get(selectors.videoGuidebutton)
              .should("be.visible")
              .should("not.be.disabled");
    
             
          });
          
    it("click and close video guide button", () => {
          
            cy.get(selectors.videoGuidebutton).click();
            cy.get(selectors.videoGuideclosebutton).click();

       
          });

    it("load and click About Trigger ", () => {

            cy.get(selectors.AboutTrigger).should("be.visible")
            .should("not.be.disabled");
        
            cy.get(selectors.AboutTrigger).click({ multiple: true });
            
      });
  
 
});
