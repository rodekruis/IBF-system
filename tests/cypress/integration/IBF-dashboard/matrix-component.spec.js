import selectors from '../../support/selectors';

// Matrix Test
describe('Matrix Overview', () => {
  beforeEach(() => {
    cy.login();
    cy.get(selectors.layersOverview).click();
  });

  it('loads and print list of layers', () => {
    cy.get(selectors.layermenu)
      .should('be.visible')
      .invoke('text')
      .should('not.be.empty');
  });

  it('loads and select all list of layers  ', () => {
    cy.get(selectors.layermenu).each(($el) => {
      cy.wrap($el).contains('Red Cross branches').click({ force: true });
      cy.wrap($el).contains('Population').click({ force: true });
      cy.wrap($el).contains('Waterpoints').click({ force: true });
      cy.wrap($el).contains('Cropland').click({ force: true });
      cy.wrap($el).contains('Grassland').click({ force: true });
      cy.wrap($el).contains('Total Population').click({ force: true });
    });
  });
});
