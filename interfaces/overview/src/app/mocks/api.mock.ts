import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { Station } from '../models/station.model';

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
    'user/login': { handler: returnLogin },
  },
};

///////////////////////////////////////////////////////////////////////////////
// GET:
///////////////////////////////////////////////////////////////////////////////

function returnAllStations() {
  const body: Station[] = [
    {
      code: '',
      name: '',
      geom: '',
      forecastLevel: 1,
      triggerInd: 1,
      triggerLevel: 1,
      triggerPerc: 1,
      triggerProb: 1,
    },
  ];

  return of(new HttpResponse({ status: 200, body }));
}

///////////////////////////////////////////////////////////////////////////////
// POST:
///////////////////////////////////////////////////////////////////////////////

function returnLogin() {
  const body = '';
  return of(new HttpResponse({ status: 200, body }));
}
