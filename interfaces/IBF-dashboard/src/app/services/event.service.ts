import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public disasterType = 'flood';
  private country: Country;

  public state = {
    event: null,
    activeEvent: null,
    activeTrigger: null,
    newEvent: null,
    newEventEarlyTrigger: null,
    triggerLeadTime: null,
    firstLeadTime: null,
    firstLeadTimeNumberString: null,
  };

  constructor(
    private timelineService: TimelineService,
    private apiService: ApiService,
    private countryService: CountryService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe(this.onMockScenarioChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.getTrigger();
  };

  private onMockScenarioChange = () => {
    this.getTrigger();
  };

  private onEvent = (event) => {
    this.state.event = event;
    this.state.activeEvent = !!this.state.event;
    this.state.activeTrigger =
      this.state.event && this.state.event.activeTrigger;
    this.state.newEvent =
      this.state.event?.startDate ===
      this.timelineService.state.today.toFormat('yyyy-LL-dd');
    this.setAlertState();

    if (this.state.activeTrigger) {
      this.getFirstTriggerDate();
      this.getTriggerLeadTime();
    }
  };

  public getTrigger() {
    if (this.country) {
      this.apiService
        .getEvent(this.country.countryCodeISO3)
        .subscribe(this.onEvent);
    }
  }

  private setAlertState = () => {
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    if (dashboardElement) {
      if (this.state.activeTrigger) {
        dashboardElement.classList.add('trigger-alert');
      } else {
        dashboardElement.classList.remove('trigger-alert');
      }
    }
  };

  private onTriggerPerLeadTime = (timesteps) => {
    let firstKey = null;
    Object.keys(timesteps).forEach((key) => {
      if (timesteps[key] === '1') {
        firstKey = !firstKey ? key : firstKey;
      }
    });
    this.state.firstLeadTime = firstKey;
    this.state.firstLeadTimeNumberString = String(
      this.state.firstLeadTime.replace(/[^\d]/g, ''),
    );
    this.state.newEventEarlyTrigger =
      firstKey < LeadTimeTriggerKey[this.timelineService.activeLeadTime];
  };

  private getFirstTriggerDate() {
    if (this.country) {
      this.apiService
        .getTriggerPerLeadTime(this.country.countryCodeISO3)
        .subscribe(this.onTriggerPerLeadTime);
    }
  }

  private getTriggerLeadTime() {
    if (this.country) {
      let triggerLeadTime = null;
      this.country.countryActiveLeadTimes.forEach((leadTime: LeadTime) => {
        if (
          !triggerLeadTime &&
          LeadTimeTriggerKey[leadTime] >= this.state.firstLeadTime
        ) {
          triggerLeadTime = LeadTimeTriggerKey[leadTime];
        }
      });
      this.state.triggerLeadTime = triggerLeadTime;
    }
  }
}
