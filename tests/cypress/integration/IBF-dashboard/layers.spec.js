describe("Check if the layers work", () => {
    beforeEach(() => {
        cy.login("uga");
    });

    it("check if layers can be activated:", function () {
        cy.fixture("layers-uga").then(layers => {
            for (let layer of layers) {
                cy.log(`Checking layer: '${layer["label"]}'`);
                // Reload open matrix menu
                cy.visit("/");
                cy.get("[data-test=layers-toggle]").click();

                // Listen for wms requests
                cy.intercept({ url: /geoserver/ }).as("wmsRequest");

                // Check if layer name is in matrix
                cy.get("[data-test=layers-control-menu]").contains(
                    layer["label"]
                );

                // Search in matrix element
                cy.get("[data-test=layers-control-menu]").within(() => {
                    // If layer is active from the start deactivate it first
                    deactivateActiveLayers(layers);
                    cy.contains("ion-item", layer["label"])
                        .parent()
                        .parent()
                        .parent()
                        .click({ force: true });

                    // Check if at least one correct wms request is made
                    if (layer["type"] === "wms") {
                        cy.wait("@wmsRequest")
                            .its("response.statusCode")
                            .should("eq", 200);
                    }

                    // Check if matrix displays that layer is active
                    cy.waitForAngular();
                    cy.contains("ion-item", layer["label"])
                        .parents(".ion-no-padding")
                        .should("have.class", "layer-active");
                });

                if (layer["type"] === "shape") {
                    // Click the a vissible admin area and see if popup contain the label of the layer
                    cy.get(
                        '[class="leaflet-interactive"][stroke="transparent"]'
                    )
                        .filter(":visible")
                        .first()
                        .click();
                    cy.get('[class="leaflet-popup-content"]').contains(
                        layer["label"]
                    );
                }
                if (layer["type"] === "point") {
                    // Clicking a point opens a popup does not work for waterpoints yet due to the point clusters
                    if (layer["label" !== "Waterpoints"]) {
                        cy.get(".leaflet-marker-icon")
                            .filter(":visible")
                            .first()
                            .click();
                        cy.waitForAngular();
                        cy.get('[class="leaflet-popup-content"]');
                    }
                }
            }
        });
    });
});

function deactivateActiveLayers(layers) {
    cy.log("deactivateActiveLayers");
    for (const layer of layers) {
        if (layer["active"] === "yes") {
            cy.log(`Disable layer ${layer["label"]}`);
            cy.contains("ion-item", layer["label"])
                .parent()
                .parent()
                .parent()
                .click({ force: true });
            cy.waitForAngular();
        }
    }
}
