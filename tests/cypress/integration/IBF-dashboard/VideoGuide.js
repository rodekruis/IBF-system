import selectors from "../../support/selectors";
import constants from "../../support/constants";

// IBF Video Guide
describe("IBF Video Guide", () => {
    beforeEach(() => {
        cy.login();
        
    });
    
    it("loads video", () => {
        cy.get(selectors.videoGuide)
          .should("be.visible")
          .should("not.be.disabled");

         
      });
      
  it("click video guide", () => {
      
        cy.get(selectors.videoGuide).click();
        
    
      });
});