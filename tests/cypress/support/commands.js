import constants from "./constants";
import selectors from "./selectors";
import 'cypress-wait-until';

Cypress.Commands.add("waitForRequests", () => {
  cy.intercept({ method: "GET", url: "**" }).as("getHttp");
  cy.wait("@getHttp", {timeout: 10000})
});

// Contains a list of custom Commands
Cypress.Commands.add("login", () => {
  const apiUrl = Cypress.env(constants.envApiUrl);

  cy.request("POST", apiUrl + constants.loginApiUrl, {
    email: Cypress.env(constants.envLoginUser),
    password: Cypress.env(constants.envLoginPassword),
  })
    .as("post")
    .then((resp) => {
      window.localStorage.setItem(constants.loginToken, resp.body.user.token);
    });

  cy.visit(constants.dashboardPagePath);
  cy.waitForRequests();
  cy.waitUntil(() => Cypress.$(selectors.loader).length === 0); // https://github.com/NoriSte/cypress-wait-until/issues/75#issuecomment-572685623
});

// Function that waits fo all promises to resolve
Cypress.Commands.add("waitForAngular", () => {
  return cy
    .window()
    .then({ timeout: constants.waitForAngularTimeout }, (win) => {
      return new Cypress.Promise((resolve, reject) => {
        let testabilities = win["getAllAngularTestabilities"]();
        if (!testabilities) {
          return reject(new Error("No testabilities. Check Angular API"));
        }
        let count = testabilities.length;
        testabilities.forEach((testability) =>
          testability.whenStable(() => {
            count--;
            if (count !== 0) return;
            resolve();
          })
        );
      });
    });
});

Cypress.Commands.overwrite("log", (subject, message) =>
  cy.task("log", message)
);
