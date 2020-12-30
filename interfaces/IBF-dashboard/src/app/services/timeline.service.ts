import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  public state = {
    selectedTimeStepButtonValue: '7-day',
    today: moment(),
    dateFormat: 'DD/MM',
    timeStepButtons: [],
  };
  private triggers: any[];
  private timelineSubject = new ReplaySubject<string>();

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
  ) {}

  getTimelineSubscription(): Observable<string> {
    return this.timelineSubject.asObservable();
  }

  private setAlertState = (triggers) => {
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    let alertState = false;
    const possibleTriggers = ['1', '2', '3', '4', '5', '6', '7'];
    possibleTriggers.forEach((triggerKey) => {
      alertState = alertState || triggers[triggerKey] == 1;
    });
    if (alertState) {
      dashboardElement.classList.add('trigger-alert');
    } else {
      dashboardElement.classList.remove('trigger-alert');
    }
  };

  public async loadTimeStepButtons() {
    const dates = await this.apiService.getRecentDates(
      this.countryService.selectedCountry.countryCode,
    );
    this.state.today = moment(dates[0].value);

    this.triggers = await this.getTrigger();

    this.setAlertState(this.triggers);

    this.state.timeStepButtons = [];

    this.state.timeStepButtons = this.filterTimeStepButtonsByCountryForecast([
      {
        dateString: this.state.today
          .clone()
          .add(1, 'days')
          .format(this.state.dateFormat),
        value: '1-day',
        alert: this.triggers['1'] == 1,
        disabled: await this.forecastDisabled('1-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(2, 'days')
          .format(this.state.dateFormat),
        value: '2-day',
        alert: this.triggers['2'] == 1,
        disabled: await this.forecastDisabled('2-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(3, 'days')
          .format(this.state.dateFormat),
        value: '3-day',
        alert: this.triggers['3'] == 1,
        disabled: await this.forecastDisabled('3-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(4, 'days')
          .format(this.state.dateFormat),
        value: '4-day',
        alert: this.triggers['4'] == 1,
        disabled: await this.forecastDisabled('4-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(5, 'days')
          .format(this.state.dateFormat),
        value: '5-day',
        alert: this.triggers['5'] == 1,
        disabled: await this.forecastDisabled('5-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(6, 'days')
          .format(this.state.dateFormat),
        value: '6-day',
        alert: this.triggers['6'] == 1,
        disabled: await this.forecastDisabled('6-day'),
        active: false,
      },
      {
        dateString: this.state.today
          .clone()
          .add(7, 'days')
          .format(this.state.dateFormat),
        value: '7-day',
        alert: this.triggers['7'] == 1,
        disabled: await this.forecastDisabled('7-day'),
        active: false,
      },
    ]);

    const enabledTimeStepButtons = this.state.timeStepButtons.filter(
      (timeStepButton) => !timeStepButton.disabled,
    );
    if (enabledTimeStepButtons.length > 0) {
      this.handleTimeStepButtonClick(enabledTimeStepButtons[0].value);
    }
  }

  filterTimeStepButtonsByCountryForecast(timeStepButtons) {
    const countryForecastTimeStepButtonIndices = this.countryService.selectedCountry.countryForecasts.map(
      (forecastValue) =>
        timeStepButtons.findIndex(
          (timeStepButton) => timeStepButton.value === forecastValue,
        ),
    );

    const countryForecastRange = Math.max.apply(
      Math,
      countryForecastTimeStepButtonIndices,
    );

    timeStepButtons.splice(countryForecastRange + 1);
    return timeStepButtons;
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.state.selectedTimeStepButtonValue = timeStepButtonValue;
    this.state.timeStepButtons.forEach((i) => (i.active = false));
    this.state.timeStepButtons.find(
      (i) => i.value === timeStepButtonValue,
    ).active = true;
    this.timelineSubject.next(this.state.selectedTimeStepButtonValue);
  }

  private async forecastDisabled(leadTime): Promise<any> {
    const leadTimes = [
      ...this.countryService.selectedCountry.countryForecasts,
    ].sort();
    const index = leadTimes.indexOf(leadTime);
    const leadTimeNotAvailable = await new Promise((resolve) => {
      resolve(index < 0);
    });
    const lowerLeadTimeNotTriggered =
      index + 1 < leadTimes.length && this.triggers[leadTime.substr(0, 1)] == 0;

    return leadTimeNotAvailable || lowerLeadTimeNotTriggered;
  }

  public async getTrigger(): Promise<any> {
    const trigger = await this.apiService.getTriggerPerLeadTime(
      this.countryService.selectedCountry.countryCode,
    );
    return trigger;
  }

  public async getEvent(): Promise<any> {
    const event = await this.apiService.getEvent(
      this.countryService.selectedCountry.countryCode,
    );
    return event;
  }
}
