import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
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
  private triggers: any[];
  private timelineSubject = new BehaviorSubject<LeadTime>(null);

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.loadTimeStepButtons();
      });
  }

  getTimelineSubscription(): Observable<LeadTime> {
    return this.timelineSubject.asObservable();
  }

  public loadTimeStepButtons(): void {
    this.countryService.getCountrySubscription().subscribe(
      async (country: Country): Promise<void> => {
        let dates = [];

        if (country) {
          dates = await this.apiService.getRecentDates(country.countryCodeISO3);
        }

        if (dates.length > 0) {
          this.state.today = moment(dates[0].value);
        }

        this.triggers = await this.getTrigger();

        if (this.triggers) {
          this.state.timeStepButtons = await Promise.all(
            [
              LeadTime.day1,
              LeadTime.day2,
              LeadTime.day3,
              LeadTime.day4,
              LeadTime.day5,
              LeadTime.day6,
              LeadTime.day7,
            ].map(
              async (leadTime: LeadTime): Promise<object> => {
                const triggerKey: string = LeadTimeTriggerKey[leadTime];
                const x = {
                  date: this.state.today.clone().add(triggerKey, 'days'),
                  value: leadTime,
                  alert: this.triggers[triggerKey] == 1,
                  disabled: await this.isLeadTimeDisabled(leadTime),
                  active: false,
                };
                return x;
              },
            ),
          );
        }

        const enabledTimeStepButtons = this.state.timeStepButtons.filter(
          (timeStepButton) => !timeStepButton.disabled,
        );
        if (enabledTimeStepButtons.length > 0) {
          this.handleTimeStepButtonClick(enabledTimeStepButtons[0].value);
        }
      },
    );
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach((i) => (i.active = false));
    this.state.timeStepButtons.find(
      (i) => i.value === timeStepButtonValue,
    ).active = true;
    this.timelineSubject.next(this.activeLeadTime);
  }

  private async isLeadTimeDisabled(leadTime: LeadTime): Promise<boolean> {
    let leadTimes = [];
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country): void => {
        leadTimes = country.countryLeadTimes;
      });

    const index = leadTimes.indexOf(leadTime);
    const leadTimeNotAvailable = index < 0;

    return leadTimeNotAvailable;
  }

  public async getTrigger(): Promise<any> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let trigger;
          if (country) {
            trigger = await this.apiService.getTriggerPerLeadTime(
              country.countryCodeISO3,
            );
          }
          resolve(trigger);
        },
      );
    });
  }

  public async getEvent(): Promise<any> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let event;
          if (country) {
            event = await this.apiService.getEvent(country.countryCodeISO3);
          }
          resolve(event);
        },
      );
    });
  }
}
