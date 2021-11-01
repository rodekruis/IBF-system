import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { Country, DisasterType } from '../models/country.model';
import { DisasterTypeService } from './disaster-type.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private country: Country;
  private disasterType: DisasterType;

  public state = {
    event: null,
    activeEvent: null,
    activeTrigger: null,
    triggerLeadTime: null,
    firstLeadTime: null,
    firstLeadTimeLabel: null,
    firstLeadTimeName: null,
    timeUnit: null,
  };

  constructor(
    private apiService: ApiService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.getTrigger();
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.getTrigger();
  };

  public getTrigger() {
    if (this.country && this.disasterType) {
      this.apiService
        .getEvent(this.country.countryCodeISO3, this.disasterType.disasterType)
        .subscribe(this.onEvent);
    }
  }

  public getTriggerByDisasterType(
    country: string,
    disasterType: DisasterType,
    callback,
  ) {
    if (country && disasterType) {
      this.apiService
        .getEvent(country, disasterType.disasterType)
        .subscribe(this.onGetDisasterTypeEvent(disasterType, callback));
    }
  }

  private onGetDisasterTypeEvent = (disasterType: DisasterType, callback) => (
    event,
  ) => {
    disasterType.activeTrigger = (event && event.activeTrigger) || false;
    callback(disasterType);
  };

  private onEvent = (event) => {
    this.state.event = event;
    if (event) {
      this.state.event.startDate = DateTime.fromISO(
        this.state.event.startDate,
      ).toFormat('cccc, dd LLLL');
    }

    this.state.activeEvent = !!this.state.event;
    this.state.activeTrigger =
      this.state.event && this.state.event.activeTrigger;
    if (event && event.endDate) {
      this.state.event.endDate = this.endDateToLastTriggerDate(
        this.state.event.endDate,
      );
    }
    this.setAlertState();

    if (this.state.activeTrigger) {
      this.getFirstTriggerDate();
    }
  };

  private endDateToLastTriggerDate(endDate: string): string {
    const originalEndDate = DateTime.fromFormat(endDate, 'yyyy-LL-dd');
    return originalEndDate.minus({ days: 7 }).toFormat('cccc, dd LLLL');
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
    if (this.country && this.disasterType) {
      this.apiService
        .getTriggerPerLeadTime(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onTriggerPerLeadTime);
    }
  }

  private onTriggerPerLeadTime = (timesteps) => {
    let firstKey = null;
    Object.keys(timesteps)
      .sort((a, b) => (a > b ? 1 : -1))
      .forEach((key) => {
        if (timesteps[key] === '1') {
          firstKey = !firstKey ? key : firstKey;
        }
      });
    this.state.firstLeadTime = firstKey;
    this.state.firstLeadTimeLabel =
      LeadTimeTriggerKey[this.state.firstLeadTime];
    this.getFirstTriggeredString();
    this.getTriggerLeadTime();
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
    if (this.country && this.disasterType) {
      let triggerLeadTime = null;
      this.country.countryDisasterSettings
        .find((s) => s.disasterType === this.disasterType.disasterType)
        .activeLeadTimes.forEach((leadTime: LeadTime) => {
          if (
            !triggerLeadTime &&
            LeadTimeTriggerKey[leadTime] >=
              LeadTimeTriggerKey[this.state.firstLeadTime]
          ) {
            triggerLeadTime = leadTime;
            this.state.triggerLeadTime = LeadTimeTriggerKey[triggerLeadTime];
            this.state.timeUnit = triggerLeadTime.split('-')[1];
          }
        });
    }
  }

  public isOldEvent = () => this.state.activeEvent && !this.state.activeTrigger;
}
