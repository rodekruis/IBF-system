import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Country } from 'src/app/models/country.model';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { ApiService } from 'src/app/services/api.service';
import { MapService } from 'src/app/services/map.service';
import { environment } from 'src/environments/environment';

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

  constructor(
    private mapService: MapService,
    private aggregatesService: AggregatesService,
    private apiService: ApiService,
  ) {
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
      {
        code: 'EGY',
        name: 'Egypt',
        forecast: ['5-day', '10-day'],
      },
    ] as Country[];

    this.selectCountry(environment.defaultCountryCode);
  }

  private async loadTimeStepButtons() {
    this.state.timeStepButtons = this.filterTimeStepButtonsByCountryForecast([
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
    const selectedCountryIndex = this.state.countries.findIndex(
      (country) => country.code === this.state.countryCode,
    );

    const selectedCountry = this.state.countries[selectedCountryIndex];

    const countryForecastTimeStepButtonIndices = selectedCountry.forecast.map(
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
    this.mapService.loadStationLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
    this.mapService.loadAdminRegionLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
    this.mapService.loadFloodExtentLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
    this.mapService.loadRainfallTriggerLayer(
      this.state.countryCode,
      this.state.selectedTimeStepButtonValue,
    );
    this.aggregatesService.loadAggregateInformation(
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
    this.mapService.loadPopulationGridLayer(countryCode);
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
