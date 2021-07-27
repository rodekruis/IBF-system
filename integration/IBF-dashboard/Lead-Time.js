import selectors from "../../support/selectors";
import constants from "../../support/constants";

// timeline button validation
describe("timeline button validation", () => {
    beforeEach(() => {
        cy.login();

    });

it("load and verify-enabled-timeLineButton", () => {

 cy.xpath(selectors.ActiveleadTimeButtons)
   .should("be.visible")
    .should("not.be.disabled");

    
    
})

   it("click on active timeline button", () =>
   {
       
    cy.xpath(selectors.ActiveleadTimeButtons).each(($el, index) =>{
    $el.click()
    cy.log(index)
        })

    });
});