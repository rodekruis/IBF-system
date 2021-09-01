
import selectors from "../../support/selectors";
import constants from "../../support/constants";

// Matrix Test
describe("Matrix Overview", () => {
    beforeEach(() => {
        cy.login();
        cy.get(selectors.layersOverview).click()    
});

    it("loads and print list of layers", () => { 
    cy.get(selectors.layermenu).should("be.visible")
            .invoke("text")
            .should("not.be.empty")
     })
    
    it("loads and select all list of layers  ", () => { 

     cy.get(selectors.layermenu).each(($el, index, $list) => {
        
           
             cy.wrap($el).contains('Red Cross branches').click({ force: true });
             cy.wrap($el).contains('Population').click({ force: true });
             cy.wrap($el).contains('Waterpoints').click({ force: true });
             cy.wrap($el).contains('Cropland').click({ force: true });
             cy.wrap($el).contains('Grassland').click({ force: true });
             cy.wrap($el).contains('Total Population').click({ force: true });
             cy.wrap($el).contains('Total cattle').click({ force: true });
             cy.wrap($el).contains('Drought').click({ force: true});
             cy.wrap($el).contains('Cattle').click({ force: true});
            cy.wrap($el).contains('Small ruminants exposed').click({ force: true });
            cy.wrap($el).contains('Total small ruminants').click({ force: true })
        })

    
     })
     it("loads and Print all layers Popup-Message and Close-Popupicon", () => { 
            
        cy.get(selectors.matrixicon).each(($el1, index, $list) => {
             cy.wrap($el1).click()
             cy.get(selectors.layerpopupmessage).should("be.visible")
               .invoke("text").should("not.be.empty")
            cy.get(selectors.layersPopupcloseIcon) .click({ multiple: true, force: true });
          
         })
        })   

    });
    
 
