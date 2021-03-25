import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import * as existingEvent from 'src/app/mocks/scenarios/existing-event';
import * as newEvent from 'src/app/mocks/scenarios/new-event';
import * as noEvent from 'src/app/mocks/scenarios/no-event';
import * as oldEvent from 'src/app/mocks/scenarios/old-event';
import { MockScenarioService } from './mock-scenario-service/mock-scenario.service';
import { MockScenario } from './mock-scenario.enum';

@Injectable({
  providedIn: 'root',
})
export class MockAPI {
  private mockScenario: MockScenario;

  constructor(private mockScenarioService: MockScenarioService) {
    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.mockScenario = mockScenario;
      });
  }

  getMockAPI(leadTime?) {
    return {
      GET: {
        stations: {
          handler: this.getResponse('getStations', leadTime),
        },
        event: { handler: this.getResponse('getEvent') },
        'triggered-areas': { handler: this.getResponse('getTriggeredAreas') },
        'recent-dates': { handler: this.getResponse('getRecentDates') },
        triggers: { handler: this.getResponse('getTriggerPerLeadTime') },
        'admin-area-data': {
          handler: this.getResponse('getAdminRegions', leadTime),
        },
      },
      POST: {
        'user/login': { handler: this.returnLogin() },
      },
    };
  }

  getResponse(functionName, leadTime?) {
    return () => {
      let body = {};
      let status = 200;

      switch (this.mockScenario) {
        case MockScenario.existingEvent: {
          body = existingEvent[functionName](leadTime);
          break;
        }
        case MockScenario.newEvent: {
          body = newEvent[functionName](leadTime);
          break;
        }
        case MockScenario.noEvent: {
          body = noEvent[functionName]();
          break;
        }
        case MockScenario.oldEvent: {
          body = oldEvent[functionName]();
          break;
        }
        default: {
          status = 400;
          body = {
            'Unknown Mock Scenario': this.mockScenario,
          };
          break;
        }
      }

      return of(new HttpResponse({ status, body }));
    };
  }

  returnLogin() {
    return () => {
      const body = '';
      return of(new HttpResponse({ status: 200, body }));
    };
  }
}
