import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Country } from 'src/app/models/country.model';
import { MapService } from 'src/app/services/map.service';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  public state = {
    countryCode: '',
    selectedTimeStepButtonValue: '7-day',
    today: moment(),
    dateFormat: 'DD/MM',
    timeStepButtons: [],
    countries: [],
  };

  constructor(private mapService: MapService, private apiService: ApiService) {
    this.state.countries = [
      {
        code: 'UGA',
        name: 'Uganda',
        forecast: ['7-day'],
      },
      {
        code: 'ZMB',
        name: 'Zambia',
        forecast: ['3-day', '7-day'],
      },
    ] as Country[];

    this.selectCountry(environment.defaultCountryCode);
  }

  private async loadTimeStepButtons() {
    this.state.timeStepButtons = [
      {
        dateString: this.state.today.format(this.state.dateFormat),
        value: 'Today',
        alert: false,
        disabled: await this.getForecast('Today'),
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
    ];
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.state.selectedTimeStepButtonValue = timeStepButtonValue;
    this.mapService.loadStationLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
    this.mapService.loadFloodExtentLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
  }

  public handleCountryChange($event) {
    this.selectCountry($event.detail.value);
  }

  public selectCountry(countryCode) {
    this.state.countryCode = countryCode;

    const countryIndex = this.state.countries.findIndex(
      (country) => country.code === countryCode,
    );
    const countryForecasts =
      countryIndex >= 0 ? this.state.countries[countryIndex].forecast : [];

    this.mapService.loadAdminRegionLayer(countryCode);
    this.mapService.loadFloodExtentLayer(countryCode);
    this.loadTimeStepButtons();
    this.handleTimeStepButtonClick(countryForecasts[0]);
  }

  private async getForecast(leadTime): Promise<any> {
    return await new Promise((resolve) => {
      const countryIndex = this.state.countries.findIndex(
        (country) => country.code === this.state.countryCode,
      );

      const countryForecasts =
        countryIndex >= 0 ? this.state.countries[countryIndex].forecast : [];

      resolve(countryForecasts.indexOf(leadTime) < 0);
    });
  }

  private async getTrigger(leadTime): Promise<any> {
    const trigger = await this.apiService.getTriggerPerLeadtime(
      this.state.countryCode,
      leadTime,
    );
    return trigger === 1;
  }
}
