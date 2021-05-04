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
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { CountryTriggers } from '../models/country-triggers.model';
import { Country } from '../models/country.model';

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

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
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
    this.loadTimeStepButtons();
  };

  private onMockScenarioChange = () => {
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
      alert:
        this.triggers[
          leadTime.includes('day') ? leadTime.substr(0, 1) : leadTime
        ] === '1',
      disabled: isLeadTimeDisabled,
      active: false,
    };
  };

  private onTriggerPerLeadTime = (triggers) => {
    this.triggers = triggers;

    if (this.triggers) {
      const vissibleLeadTimes = this.getVisibleLeadTimes(this.country);
      vissibleLeadTimes.map(this.leadTimeToLeadTimeButton);
    }

    const enabledTimeStepButtons = this.state.timeStepButtons.filter(
      (timeStepButton) => !timeStepButton.disabled,
    );
    if (enabledTimeStepButtons.length > 0) {
      this.handleTimeStepButtonClick(enabledTimeStepButtons[0].value);
    }
  };

  private onRecentDates = (dates) => {
    if (dates.length > 0) {
      this.state.today = DateTime.fromISO(dates[0].date);
    }

    this.apiService
      .getTriggerPerLeadTime(this.country.countryCodeISO3)
      .subscribe(this.onTriggerPerLeadTime);
  };

  public loadTimeStepButtons(): void {
    if (this.country) {
      this.apiService
        .getRecentDates(this.country.countryCodeISO3)
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
    const vissibleLeadTimes = [];
    for (const disaster of country.disasterTypes) {
      for (const leadTime of disaster.leadTimes) {
        if (vissibleLeadTimes.indexOf(leadTime.leadTimeName) === -1) {
          vissibleLeadTimes.push(leadTime.leadTimeName);
        }
      }
    }
    return vissibleLeadTimes;
  }
}
