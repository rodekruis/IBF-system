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
  private timelineSubject = new ReplaySubject<string>();

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
  ) {}

  getTimelineSubscription(): Observable<string> {
    return this.timelineSubject.asObservable();
  }

  public async loadTimeStepButtons() {
    const dates = await this.apiService.getRecentDates(
      this.countryService.selectedCountry.countryCode,
    );
    this.state.today = moment(dates[0].value);

    const triggers = await this.getTrigger();

    this.state.timeStepButtons = [];

    this.state.timeStepButtons = this.filterTimeStepButtonsByCountryForecast([
      {
        dateString: this.state.today.format(this.state.dateFormat),
        value: 'Today',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(1, 'days')
          .format(this.state.dateFormat),
        value: '1-day',
        alert: triggers['1'] == 1,
        disabled: await this.getForecast('1-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(2, 'days')
          .format(this.state.dateFormat),
        value: '2-day',
        alert: triggers['2'] == 1,
        disabled: await this.getForecast('2-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(3, 'days')
          .format(this.state.dateFormat),
        value: '3-day',
        alert: triggers['3'] == 1,
        disabled: await this.getForecast('3-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(4, 'days')
          .format(this.state.dateFormat),
        value: '4-day',
        alert: triggers['4'] == 1,
        disabled: await this.getForecast('4-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(5, 'days')
          .format(this.state.dateFormat),
        value: '5-day',
        alert: triggers['5'] == 1,
        disabled: await this.getForecast('5-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(6, 'days')
          .format(this.state.dateFormat),
        value: '6-day',
        alert: triggers['6'] == 1,
        disabled: await this.getForecast('6-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(7, 'days')
          .format(this.state.dateFormat),
        value: '7-day',
        alert: triggers['7'] == 1,
        disabled: await this.getForecast('7-day'),
      },
    ]);
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
    this.timelineSubject.next(this.state.selectedTimeStepButtonValue);
  }

  private async getForecast(leadTime): Promise<any> {
    return await new Promise((resolve) => {
      resolve(
        this.countryService.selectedCountry.countryForecasts.indexOf(leadTime) <
          0,
      );
    });
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
