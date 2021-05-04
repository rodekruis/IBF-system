import constants from "./constants";

// Contains a list of custom Commands
Cypress.Commands.add("login", () => {
    const apiUrl = Cypress.env(constants.envApiUrl);

    cy.request("POST", apiUrl + constants.loginApiUrl, {
        email: Cypress.env(constants.envLoginUser),
        password: Cypress.env(constants.envLoginPassword),
    })
        .as("post")
        .then((resp) => {
            window.localStorage.setItem(
                constants.loginToken,
                resp.body.user.token
            );
        });

    cy.visit(constants.dashboardPagePath);
});

// Function that waits fo all promises to resolve
Cypress.Commands.add("waitForAngular", () => {
    return cy
        .window()
        .then({ timeout: constants.waitForAngularTimeout }, (win) => {
            return new Cypress.Promise((resolve, reject) => {
                let testabilities = win["getAllAngularTestabilities"]();
                if (!testabilities) {
                    return reject(
                        new Error("No testabilities. Check Angular API")
                    );
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
