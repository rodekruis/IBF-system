// Contains a list of custom Commands
Cypress.Commands.add("login", (country) => {
  cy.fixture('login-' + country).then((login) => {
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

// Funcation that waits fo all promises to resolve
Cypress.Commands.add("waitForAngular", () => {
  return cy.window().then({ timeout: 25000 }, win => {
    return new Cypress.Promise((resolve, reject) => {
      let testabilities = win['getAllAngularTestabilities']();
      if (!testabilities) {
        return reject(new Error('No testabilities. Check Angular API'));
      }
      let count = testabilities.length;
      testabilities.forEach(testability => testability.whenStable(() => {
        count--;
        if (count !== 0) return;
        resolve();
      }));
    });
  });
})

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
