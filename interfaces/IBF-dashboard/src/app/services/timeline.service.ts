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
    today: null,
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
    this.state.timeStepButtons = [];
    
    const max_date = (await this.apiService.getRecentDate(this.countryService.selectedCountry.countryCode)).max_date;
    this.state.today = moment(max_date);

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
        alert: await this.getTrigger('1-day'),
        disabled: await this.getForecast('1-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(2, 'days')
          .format(this.state.dateFormat),
        value: '2-day',
        alert: await this.getTrigger('2-day'),
        disabled: await this.getForecast('2-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(3, 'days')
          .format(this.state.dateFormat),
        value: '3-day',
        alert: await this.getTrigger('3-day'),
        disabled: await this.getForecast('3-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(4, 'days')
          .format(this.state.dateFormat),
        value: '4-day',
        alert: await this.getTrigger('4-day'),
        disabled: await this.getForecast('4-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(5, 'days')
          .format(this.state.dateFormat),
        value: '5-day',
        alert: await this.getTrigger('5-day'),
        disabled: await this.getForecast('5-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(6, 'days')
          .format(this.state.dateFormat),
        value: '6-day',
        alert: await this.getTrigger('6-day'),
        disabled: await this.getForecast('6-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(7, 'days')
          .format(this.state.dateFormat),
        value: '7-day',
        alert: await this.getTrigger('7-day'),
        disabled: await this.getForecast('7-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(8, 'days')
          .format(this.state.dateFormat),
        value: '8-day',
        alert: await this.getTrigger('8-day'),
        disabled: await this.getForecast('8-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(9, 'days')
          .format(this.state.dateFormat),
        value: '9-day',
        alert: await this.getTrigger('9-day'),
        disabled: await this.getForecast('9-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(10, 'days')
          .format(this.state.dateFormat),
        value: '10-day',
        alert: await this.getTrigger('10-day'),
        disabled: await this.getForecast('10-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(11, 'days')
          .format(this.state.dateFormat),
        value: '11-day',
        alert: await this.getTrigger('11-day'),
        disabled: await this.getForecast('11-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(12, 'days')
          .format(this.state.dateFormat),
        value: '12-day',
        alert: await this.getTrigger('12-day'),
        disabled: await this.getForecast('12-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(13, 'days')
          .format(this.state.dateFormat),
        value: '13-day',
        alert: await this.getTrigger('13-day'),
        disabled: await this.getForecast('13-day'),
      },
      {
        dateString: this.state.today
          .clone()
          .add(14, 'days')
          .format(this.state.dateFormat),
        value: '14-day',
        alert: await this.getTrigger('14-day'),
        disabled: await this.getForecast('14-day'),
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

  public async getTrigger(leadTime): Promise<any> {
    const trigger = await this.apiService.getTriggerPerLeadtime(
      this.countryService.selectedCountry.countryCode,
      leadTime,
    );
    return trigger === 1;
  }

  public async getEvent(): Promise<any> {
    const event = await this.apiService.getEvent(
      this.countryService.selectedCountry.countryCode,
    );
    console.log(event);
    return event;
  }
}
