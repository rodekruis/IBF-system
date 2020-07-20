import { HttpResponse } from "@angular/common/http";
import { of } from "rxjs";
import mockStationsGeoJSON from "./stations.geojson.mock.data";

/**
 * Mock API:
 *
 * Per request-method, multiple properties can be defined.
 * Properties can be full API-paths or only API-endpoints.
 *
 * For example:
 *
 *   GET: {
 *     stations: { handler: returnAllStations },
 *     'stations/ZMB/Current/5-day': { handler: returnStationsFor5Day },
 *   }
 *
 * Handlers:
 *
 * Make sure to properly type the responses based on the (back-end) models.
 * See the folder: ../models/
 * This helps to keep the mock-data in sync with the real data.
 *
 */
export const MockApi = {
    GET: {
        stations: { handler: returnAllStations },
    },
    POST: {
        "user/login": { handler: returnLogin },
    },
};

///////////////////////////////////////////////////////////////////////////////
// GET:
///////////////////////////////////////////////////////////////////////////////

function returnAllStations() {
    const body = mockStationsGeoJSON;

    return of(new HttpResponse({ status: 200, body }));
}

///////////////////////////////////////////////////////////////////////////////
// POST:
///////////////////////////////////////////////////////////////////////////////

function returnLogin() {
    const body = "";
    return of(new HttpResponse({ status: 200, body }));
}
