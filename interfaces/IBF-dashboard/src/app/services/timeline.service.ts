import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { CountryTriggers } from '../models/country-triggers.model';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  public activeLeadTime: LeadTime;
  public state = {
    today: moment(),
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
      .subscribe((country: Country) => {
        this.country = country;
        this.loadTimeStepButtons();
      });

    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadTimeStepButtons();
    });
  }

  getTimelineSubscription(): Observable<LeadTime> {
    return this.timelineSubject.asObservable();
  }

  public loadTimeStepButtons(): void {
    if (this.country) {
      this.apiService
        .getRecentDates(this.country.countryCodeISO3)
        .subscribe((dates) => {
          if (dates.length > 0) {
            this.state.today = moment(dates[0].value);
          }

          this.apiService
            .getTriggerPerLeadTime(this.country.countryCodeISO3)
            .subscribe((triggers) => {
              this.triggers = triggers;

              if (this.triggers) {
                [
                  LeadTime.day1,
                  LeadTime.day2,
                  LeadTime.day3,
                  LeadTime.day4,
                  LeadTime.day5,
                  LeadTime.day6,
                  LeadTime.day7,
                ].map((leadTime: LeadTime, index: number): void => {
                  const isLeadTimeDisabled = this.isLeadTimeDisabled(leadTime);
                  const triggerKey = LeadTimeTriggerKey[leadTime];
                  this.state.timeStepButtons[index] = {
                    date: this.state.today.clone().add(triggerKey, 'days'),
                    value: leadTime,
                    alert: this.triggers[triggerKey] === '1',
                    disabled: isLeadTimeDisabled,
                    active: false,
                  };
                });
              }

              const enabledTimeStepButtons = this.state.timeStepButtons.filter(
                (timeStepButton) => !timeStepButton.disabled,
              );
              if (enabledTimeStepButtons.length > 0) {
                this.handleTimeStepButtonClick(enabledTimeStepButtons[0].value);
              }
            });
        });
    }
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach((i) => (i.active = false));
    this.state.timeStepButtons.find(
      (i) => i.value === timeStepButtonValue,
    ).active = true;
    this.timelineSubject.next(this.activeLeadTime);
  }

  private isLeadTimeDisabled(leadTime: LeadTime): boolean {
    const leadTimes = this.country ? this.country.countryLeadTimes : [];
    const leadTimeIndex = leadTimes.indexOf(leadTime);
    const leadTimeNotAvailable = leadTimeIndex < 0;
    return leadTimeNotAvailable;
  }
}
