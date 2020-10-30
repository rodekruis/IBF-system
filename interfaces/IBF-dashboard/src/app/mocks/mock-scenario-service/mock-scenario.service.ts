import { Injectable } from '@angular/core';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';

@Injectable({
  providedIn: 'root',
})
export class MockScenarioService {
  public mockScenario: MockScenario = MockScenario.real;
  public mockScenarios: MockScenario[] = [
    MockScenario.real,
    MockScenario.noEvent,
    MockScenario.newEvent,
    MockScenario.existingEvent,
    MockScenario.oldEvent,
  ];

  constructor(
    private eapActionsService: EapActionsService,
    private timelineService: TimelineService,
    private mapService: MapService,
    private eventService: EventService,
    public aggregatesService: AggregatesService,
  ) {}

  public setMockScenario(mockScenario: MockScenario) {
    this.mockScenario = mockScenario;
    this.callMockScenarioAPIs();
  }

  // functions which need to be called on mock scenario change go here
  async callMockScenarioAPIs() {
    await this.timelineService.loadTimeStepButtons();
    await this.eventService.getTrigger();
    // this.timelineService.getEvent(); called by this.eventService.getTrigger();
    await this.aggregatesService.loadAggregateInformation();
    await this.eapActionsService.loadDistrictsAndActions();
    await this.mapService.loadAdminRegionLayer();
    await this.mapService.loadStationLayer();
  }
}
