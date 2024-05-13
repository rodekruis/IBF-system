describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.get('[data-test="heading-display-name-label"] span').should(
      'contain.text',
      'IBF PORTAL',
    );
  });
});
