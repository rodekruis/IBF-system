describe("Load the dashboard triggered", () => {
    beforeEach(() => {
        cy.login("zam");
    });

    it("shows chat with red background", function () {
        cy.get("[data-test=chat]");
        // Needs tests to check if tiggered
    });
});
