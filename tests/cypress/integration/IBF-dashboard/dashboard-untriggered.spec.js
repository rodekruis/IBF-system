describe('Load the dashboard non triggered', () => {
  beforeEach(() => {
    cy.login('uga');
  });

  // Real API call
  it('lets the user log in programatically', function () {
    cy.fixture('login-uga').then((login) => {
      const apiUrl = Cypress.env('apiUrl');
      cy.request('POST', apiUrl + '/user/login', {
        email: login.email,
        password: login.password,
      }).as('post');

      cy.visit('/')
    });
  });

  it('shows chat with blue about-trigger button', function () {
    cy.get('[data-cy=chat]')
    cy.get('[data-cy=chat-about-trigger]').should('have.class', 'ion-color-ibf-royal-blue')
  });

  it('shows video guide in chat and opens popup', function () {
    cy.get('[data-cy=video-guide-button]').click()
    // After click show video popover
    cy.get('[data-cy=video-popover]')
  });


  it('shows aggregate values of 0', function () {
    cy.get('[data-cy=aggregate-list]').each(() => {
      cy.get('[data-cy=aggregate-number').contains('0')
    })
  });

  it('checks if layer matrix is hidden', function () {
    cy.get('[data-cy=layers-control-menu]').should('not.be.visible')
  });


  it('show layer matrix after click', function () {
    cy.get('[data-cy=layers-toggle]').click()
    cy.get('[data-cy=layers-control-menu]').should('be.visible')
  });
});
