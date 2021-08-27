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
/* close all popup windows */
Cypress.Commands.add('closeAllTabs', () => {
  if (!myTabs.length) {
      return;
  }
  myTabs.forEach((v, k) => {
      if (k > 0) {
          try {
              myTabs[k].close()
          } catch (e) {
              console.error(e)
          }
          myTabs[k] = null;
      }
  })
  myTabNames.splice(1)
  myTabs.splice(1) // keep first one only
  // return to state 0 (main / root / original window)
  active_tab_index = 0;
  cy.state('document', myTabs[0].document)
  cy.state('window', myTabs[0])
})
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
