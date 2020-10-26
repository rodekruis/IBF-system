import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Observable, ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MockScenario } from '../mocks/mock-scenario.enum';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  public dates: any[];

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

  public async loadTodayOptionsDebug() {
    const dates = await this.apiService.getRecentDates(
      this.countryService.selectedCountry.countryCode,
    );
    this.dates = dates.map((date) => {
      return {
        label: moment(date.date).format(this.state.dateFormat),
        value: moment(date.date),
      };
    });
    this.state.today = moment(dates[0].date);
  }

  public changeToday(event) {
    const today = event.detail.value;
    this.loadTimeStepButtons(today);
  }

  public async loadTimeStepButtons(today?: Moment) {
    if (today) {
      this.state.today = today;
    } else {
      this.state.today = moment(this.dates[0].value);
    }

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
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(8, 'days')
      //     .format(this.state.dateFormat),
      //   value: '8-day',
      //   alert: triggers['8'] == 1,
      //   disabled: await this.getForecast('8-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(9, 'days')
      //     .format(this.state.dateFormat),
      //   value: '9-day',
      //   alert: triggers['9'] == 1,
      //   disabled: await this.getForecast('9-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(10, 'days')
      //     .format(this.state.dateFormat),
      //   value: '10-day',
      //   alert: triggers['10'] == 1,
      //   disabled: await this.getForecast('10-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(11, 'days')
      //     .format(this.state.dateFormat),
      //   value: '11-day',
      //   alert: triggers['11'] == 1,
      //   disabled: await this.getForecast('11-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(12, 'days')
      //     .format(this.state.dateFormat),
      //   value: '12-day',
      //   alert: triggers['12'] == 1,
      //   disabled: await this.getForecast('12-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(13, 'days')
      //     .format(this.state.dateFormat),
      //   value: '13-day',
      //   alert: triggers['13'] == 1,
      //   disabled: await this.getForecast('13-day'),
      // },
      // {
      //   dateString: this.state.today
      //     .clone()
      //     .add(14, 'days')
      //     .format(this.state.dateFormat),
      //   value: '14-day',
      //   alert: triggers['14'] == 1,
      //   disabled: await this.getForecast('14-day'),
      // },
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
    const trigger = await this.apiService.getTriggerPerLeadtime(
      this.countryService.selectedCountry.countryCode,
    );
    return trigger;
  }

  public async getEvent(): Promise<any> {
    const mockScenario = MockScenario.newEvent;
    const event = await this.apiService.getEvent(
      this.countryService.selectedCountry.countryCode,
      mockScenario,
    );
    return event;
  }
}
