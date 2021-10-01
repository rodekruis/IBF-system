import selectors from "../../support/selectors";
import constants from "../../support/constants";

// timeline validation
describe("timeline validation", () => {
    beforeEach(() => {
        cy.login();

    });

it("load and validate timeLineButton", () => {

 cy.get(selectors.timelineButton)
   .should("be.visible")
    .should("not.be.disabled");

    
    
})

   it("click on active timeline button", () =>
   {
    cy.get(selectors.timelineButtonActive).as("Activebutton");
    cy.get("@Activebutton").then(($button)=>{
        cy.wrap($button).should("be.visible")
        .should("not.be.disabled").click();

        })

    });
});