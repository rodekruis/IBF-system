import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CountryService } from './country.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public leadTime: string;
  public event: any;
  public activeEvent: boolean;
  public activeTrigger: boolean;
  public newEvent: boolean;

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
  ) {}

  public async getTrigger() {
    this.state.event = await this.timelineService.getEvent();
    this.state.activeEvent = !!this.state.event;
    this.state.activeTrigger = this.state.event && !this.state.event?.end_date;
    this.state.newEvent =
      this.state.event?.start_date ===
      this.timelineService.state.today.format('YYYY-MM-DD');

    if (this.state.activeTrigger) {
      this.getFirstTriggerDate();
      this.getTriggerLeadTime();
    }
  }

  private async getFirstTriggerDate() {
    const timesteps = await this.apiService.getTriggerPerLeadTime(
      this.countryService.selectedCountry.countryCode,
    );
    let firstKey = null;
    Object.keys(timesteps).forEach((key) => {
      if (timesteps[key] == 1) {
        firstKey = !firstKey ? key : firstKey;
      }
    });
    this.state.firstLeadTime = firstKey;
    const selectedKey = Number(
      this.timelineService.state.selectedTimeStepButtonValue.substr(0, 1),
    );
    this.state.newEventEarlyTrigger = firstKey < selectedKey;
  }

  private async getTriggerLeadTime() {
    let triggerLeadTime = null;
    this.countryService.selectedCountry.countryForecasts.forEach((leadtime) => {
      if (
        !triggerLeadTime &&
        Number(leadtime.substr(0, 1)) >= this.state.firstLeadTime
      ) {
        triggerLeadTime = Number(leadtime.substr(0, 1));
        console.log(
          'this.state.triggerLeadTime: ',
          this.timelineService.state.selectedTimeStepButtonValue,
        );
      }
    });
    this.state.triggerLeadTime = triggerLeadTime;
  }
}
