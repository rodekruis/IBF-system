import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { CountryTriggers } from '../models/country-triggers.model';
import { Country, DisasterType } from '../models/country.model';
import { DisasterTypeService } from './disaster-type.service';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  public activeLeadTime: LeadTime;
  public state = {
    today: DateTime.now(),
    timeStepButtons: [],
  };
  private triggers: CountryTriggers;
  private timelineSubject = new BehaviorSubject<LeadTime>(null);
  private country: Country;
  private disasterType: DisasterType;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private apiService: ApiService,
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
    this.loadTimeStepButtons();
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.loadTimeStepButtons();
  };

  getTimelineSubscription(): Observable<LeadTime> {
    return this.timelineSubject.asObservable();
  }

  private leadTimeToLeadTimeButton = (
    leadTime: LeadTime,
    index: number,
  ): void => {
    const isLeadTimeDisabled = this.isLeadTimeDisabled(leadTime);
    const triggerKey = LeadTimeTriggerKey[leadTime];
    this.state.timeStepButtons[index] = {
      date: this.getLeadTimeDate(leadTime, triggerKey),
      unit: leadTime.split('-')[1] as LeadTimeUnit,
      value: leadTime,
      alert: this.triggers[leadTime] === '1',
      disabled: isLeadTimeDisabled,
      active: false,
    };
  };

  private onTriggerPerLeadTime = (triggers) => {
    this.triggers = triggers;

    if (this.triggers) {
      this.state.timeStepButtons = [];
      const visibleLeadTimes = this.getVisibleLeadTimes(this.country);
      visibleLeadTimes.map(this.leadTimeToLeadTimeButton);
    }

    const enabledTimeStepButtons = this.state.timeStepButtons.filter(
      (timeStepButton) => !timeStepButton.disabled,
    );
    if (enabledTimeStepButtons.length > 0) {
      this.handleTimeStepButtonClick(enabledTimeStepButtons[0].value);
    }
  };

  private onRecentDates = (date) => {
    if (date) {
      this.state.today = DateTime.fromISO(date.date);
    }

    this.apiService
      .getTriggerPerLeadTime(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
      )
      .subscribe(this.onTriggerPerLeadTime);
  };

  public loadTimeStepButtons(): void {
    if (this.country) {
      this.apiService
        .getRecentDates(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onRecentDates);
    }
  }

  private deactivateLeadTimeButton = (leadTimeButton) =>
    (leadTimeButton.active = false);

  private filterLeadTimeButtonByLeadTime = (leadTime) => (leadTimeButton) =>
    leadTimeButton.value === leadTime;

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach(this.deactivateLeadTimeButton);
    this.state.timeStepButtons.find(
      this.filterLeadTimeButtonByLeadTime(timeStepButtonValue),
    ).active = true;
    this.timelineSubject.next(this.activeLeadTime);
  }

  private getLeadTimeDate(leadTime: LeadTime, triggerKey: string) {
    if (leadTime.includes('day')) {
      return this.state.today.plus({ days: Number(triggerKey) });
    } else {
      return this.state.today.plus({ months: Number(triggerKey) });
    }
  }

  private isLeadTimeDisabled(leadTime: LeadTime): boolean {
    const leadTimes = this.country ? this.country.countryActiveLeadTimes : [];
    const leadTimeIndex = leadTimes.indexOf(leadTime);
    const leadTimeNotAvailable = leadTimeIndex < 0;
    return leadTimeNotAvailable;
  }

  private getVisibleLeadTimes(country: Country) {
    const visibleLeadTimes = [];
    for (const leadTime of this.disasterType.leadTimes) {
      if (visibleLeadTimes.indexOf(leadTime.leadTimeName) === -1) {
        visibleLeadTimes.push(leadTime.leadTimeName);
      }
    }
    return visibleLeadTimes;
  }
}
