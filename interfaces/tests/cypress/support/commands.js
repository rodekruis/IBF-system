// Contains a list of custom Commands

Cypress.Commands.add('setDashboard', () => { Cypress.config("baseUrl", Cypress.config("baseUrl")) });
