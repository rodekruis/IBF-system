describe('Login Page', () => {
  beforeEach(() => {
    cy.server();
  });

  // Real API call
  it('lets the user log in programatically', function () {
    cy.fixture('login').then((login) => {
      const apiUrl = Cypress.env('apiUrl');
      cy.request('POST', apiUrl + '/user/login', {
        email: login.email,
        password: login.password,
      }).as('post');

      cy.visit('/')

    });
  });
});
