// Contains a list of custom Commands
Cypress.Commands.add("login", (login) => {
  cy.fixture('login').then((login) => {
    const apiUrl = Cypress.env('apiUrl');
    cy.request('POST', apiUrl + '/user/login', {
      email: login.email,
      password: login.password,
    }).as('post').then((resp) => {
      window.localStorage.setItem('jwt', resp.body.user.token)
    })
    cy.visit('/')
  })
})
