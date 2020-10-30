import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';
import { Country } from 'src/app/models/country.model';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';

@Injectable({
  providedIn: 'root',
})
export class MockScenarioService {
  public mockScenario: MockScenario = MockScenario.real;
  public mockScenarios: MockScenario[];
  private countrySubscription: Subscription;

  constructor(
    private eapActionsService: EapActionsService,
    private timelineService: TimelineService,
    private mapService: MapService,
    private eventService: EventService,
    public aggregatesService: AggregatesService,
    private countryService: CountryService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        this.setAvailableMockScenarios(country);
      });
  }

  private setAvailableMockScenarios(country: Country) {
    if (country.countryCode === 'UGA') {
      this.mockScenarios = [
        MockScenario.real,
        MockScenario.noEvent,
        MockScenario.newEvent,
        MockScenario.existingEvent,
        MockScenario.oldEvent,
      ];
    } else {
      this.mockScenarios = [MockScenario.real];
    }
  }

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
