import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private country: Country;

  public state = {
    event: null,
    activeEvent: null,
    activeTrigger: null,
    newEvent: null,
    newEventEarlyTrigger: null,
    triggerLeadTime: null,
    firstLeadTime: null,
    firstLeadTimeLabel: null,
    firstLeadTimeName: null,
  };

  constructor(
    private timelineService: TimelineService,
    private apiService: ApiService,
    private countryService: CountryService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.getTrigger();
  };

  public getTrigger() {
    if (this.country) {
      this.apiService
        .getEvent(this.country.countryCodeISO3)
        .subscribe(this.onEvent);
    }
  }

  private onEvent = (event) => {
    this.state.event = event;
    this.state.activeEvent = !!this.state.event;
    this.state.activeTrigger =
      this.state.event && this.state.event.activeTrigger;
    this.state.newEvent =
      this.state.event?.startDate ===
      this.timelineService.state.today.toFormat('yyyy-LL-dd');
    this.state.event.endDate = this.adaptEndDate(this.state.event.endDate);
    this.setAlertState();

    if (this.state.activeTrigger) {
      this.getFirstTriggerDate();
    }
  };

  private adaptEndDate(endDate: string): string {
    const originalEndDate = DateTime.fromFormat(endDate, 'yyyy-LL-dd');
    return originalEndDate.minus({ days: 7 }).toFormat('yyyy-LL-dd');
  }

  private setAlertState = () => {
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    if (dashboardElement) {
      if (this.state.activeTrigger) {
        dashboardElement.classList.remove('no-alert');
        dashboardElement.classList.add('trigger-alert');
      } else {
        dashboardElement.classList.remove('trigger-alert');
        dashboardElement.classList.add('no-alert');
      }
    }
  };

  private getFirstTriggerDate() {
    if (this.country) {
      this.apiService
        .getTriggerPerLeadTime(this.country.countryCodeISO3)
        .subscribe(this.onTriggerPerLeadTime);
    }
  }

  private onTriggerPerLeadTime = (timesteps) => {
    let firstKey = null;
    Object.keys(timesteps).forEach((key) => {
      if (timesteps[key] === '1') {
        firstKey = !firstKey ? key : firstKey;
      }
    });
    this.state.firstLeadTime = firstKey;
    this.state.firstLeadTimeLabel =
      LeadTimeTriggerKey[this.state.firstLeadTime];
    this.getFirstTriggeredString();
    this.getTriggerLeadTime();
    this.state.newEventEarlyTrigger =
      firstKey < LeadTimeTriggerKey[this.timelineService.activeLeadTime];
  };

  private getFirstTriggeredString(): void {
    const timeUnitsInFuture = Number(this.state.firstLeadTime.split('-')[0]);
    let futureDateTime: DateTime;
    const today = DateTime.now();
    if (this.state.firstLeadTime.includes('day')) {
      futureDateTime = today.plus({ days: Number(timeUnitsInFuture) });
    } else {
      futureDateTime = today.plus({ months: Number(timeUnitsInFuture) });
    }
    const monthString = new Date(
      futureDateTime.year,
      futureDateTime.month - 1,
      1,
    ).toLocaleString('default', { month: 'long' });
    if (
      this.state.firstLeadTime &&
      this.state.firstLeadTime.split('-')[1] === LeadTimeUnit.month
    ) {
      this.state.firstLeadTimeName = `${monthString} ${futureDateTime.year}`;
    } else {
      this.state.firstLeadTimeName = `${futureDateTime.day} ${monthString} ${futureDateTime.year}`;
    }
  }

  private getTriggerLeadTime() {
    if (this.country) {
      let triggerLeadTime = null;
      this.country.countryActiveLeadTimes.forEach((leadTime: LeadTime) => {
        if (
          !triggerLeadTime &&
          LeadTimeTriggerKey[leadTime] >=
            LeadTimeTriggerKey[this.state.firstLeadTime]
        ) {
          triggerLeadTime = LeadTimeTriggerKey[leadTime];
        }
      });
      this.state.triggerLeadTime = triggerLeadTime;
    }
  }
}
function moment(endDate: string) {
  throw new Error('Function not implemented.');
}
