describe('Check if the layers work', () => {
  beforeEach(() => {
    cy.server();
    cy.login();
  });


  it('check if layers can be activated:', function () {
    cy.fixture('layers-uga').then((layers) => {
      cy.get('[data-cy=layers-toggle]').click()
      for (let layer of layers) {
        cy.get('[data-cy=layers-control-menu]').contains(layer['label'])
        cy.get('[data-cy=layers-control-menu]').within(() => {
          // If layer is not active click it
          if (layer['active'] === 'no') {
            cy.contains('ion-item', layer['label']).parent().parent().parent().click({ force: true })
          }
          // Layer take some time to load
          cy.wait(5000);
          // Check if layers is active
          cy.contains('ion-item', layer['label']).parents('.ion-no-padding').should('have.class', 'layer-active')
        })
      }
    })
  })
});

