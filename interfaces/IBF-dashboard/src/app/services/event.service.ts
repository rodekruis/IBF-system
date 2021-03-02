import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public disasterType: string = 'flood';

  public state = {
    event: null,
    activeEvent: null,
    activeTrigger: null,
    newEvent: null,
    newEventEarlyTrigger: null,
    triggerLeadTime: null,
    firstLeadTime: null,
  };

  constructor(
    private timelineService: TimelineService,
    private apiService: ApiService,
    private countryService: CountryService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.getTrigger();
      });
  }

  public async getTrigger() {
    this.state.event = await this.timelineService.getEvent();
    this.state.activeEvent = !!this.state.event;
    this.state.activeTrigger =
      this.state.event && this.state.event.activeTrigger;
    this.state.newEvent =
      this.state.event?.startDate ===
      this.timelineService.state.today.format('YYYY-MM-DD');
    this.setAlertState();

    if (this.state.activeTrigger) {
      this.getFirstTriggerDate();
      this.getTriggerLeadTime();
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

  private getFirstTriggerDate() {
    this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        if (country) {
          const timesteps = await this.apiService.getTriggerPerLeadTime(
            country.countryCodeISO3,
          );
          let firstKey = null;
          Object.keys(timesteps).forEach((key) => {
            if (timesteps[key] == 1) {
              firstKey = !firstKey ? key : firstKey;
            }
          });
          this.state.firstLeadTime = firstKey;
          this.state.newEventEarlyTrigger =
            firstKey < LeadTimeTriggerKey[this.timelineService.activeLeadTime];
        }
      });
  }

  private getTriggerLeadTime() {
    this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        if (country) {
          let triggerLeadTime = null;
          country.countryLeadTimes.forEach((leadTime: LeadTime) => {
            if (
              !triggerLeadTime &&
              LeadTimeTriggerKey[leadTime] >= this.state.firstLeadTime
            ) {
              triggerLeadTime = LeadTimeTriggerKey[leadTime];
            }
          });
          this.state.triggerLeadTime = triggerLeadTime;
        }
      });
  }
}
