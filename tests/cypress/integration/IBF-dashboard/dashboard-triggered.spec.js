describe('Load the dashboard triggered', () => {
  beforeEach(() => {
    cy.login('eth');
  });

  it('shows chat with red about-trigger button', function () {
    cy.get('[data-cy=chat]')
    cy.get('[data-cy=chat-about-trigger]').within(($app) => {
      cy.get('ion-button').should('have.class', 'ion-color-ibf-salmon')
    })
  });

});