import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
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
    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadTimeStepButtons();
    });
  }

  getTimelineSubscription(): Observable<LeadTime> {
    return this.timelineSubject.asObservable();
  }

  public loadTimeStepButtons(): void {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country): void => {
        if (country) {
          this.apiService
            .getRecentDates(country.countryCodeISO3)
            .subscribe((dates) => {
              if (dates.length > 0) {
                this.state.today = moment(dates[0].value);
              }

              this.getTrigger().subscribe((triggers) => {
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
                    this.isLeadTimeDisabled(leadTime).subscribe(
                      (isLeadTimeDisabled): void => {
                        const triggerKey = LeadTimeTriggerKey[leadTime];
                        this.state.timeStepButtons[index] = {
                          date: this.state.today
                            .clone()
                            .add(triggerKey, 'days'),
                          value: leadTime,
                          alert: this.triggers[triggerKey] == 1,
                          disabled: isLeadTimeDisabled,
                          active: false,
                        };
                      },
                    );
                  });
                }

                const enabledTimeStepButtons = this.state.timeStepButtons.filter(
                  (timeStepButton) => !timeStepButton.disabled,
                );
                if (enabledTimeStepButtons.length > 0) {
                  this.handleTimeStepButtonClick(
                    enabledTimeStepButtons[0].value,
                  );
                }
              });
            });
        }
      });
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach((i) => (i.active = false));
    this.state.timeStepButtons.find(
      (i) => i.value === timeStepButtonValue,
    ).active = true;
    this.timelineSubject.next(this.activeLeadTime);
  }

  private isLeadTimeDisabled(leadTime: LeadTime): Observable<boolean> {
    return new Observable((subject) => {
      this.countryService
        .getCountrySubscription()
        .subscribe((country: Country): void => {
          let leadTimes = [];
          leadTimes = country.countryLeadTimes;

          const index = leadTimes.indexOf(leadTime);
          const leadTimeNotAvailable = index < 0;

          subject.next(leadTimeNotAvailable);
        });
    });
  }

  public getTrigger(): Observable<any> {
    return new Observable((subject): void => {
      this.countryService
        .getCountrySubscription()
        .subscribe((country: Country): void => {
          if (country) {
            this.apiService
              .getTriggerPerLeadTime(country.countryCodeISO3)
              .subscribe((trigger) => {
                subject.next(trigger);
              });
          }
        });
    });
  }

  public getEvent(): Observable<any> {
    return new Observable((subject): void => {
      this.countryService
        .getCountrySubscription()
        .subscribe((country: Country): void => {
          if (country) {
            this.apiService
              .getEvent(country.countryCodeISO3)
              .subscribe((event) => {
                subject.next(event);
              });
          }
        });
    });
  }
}
