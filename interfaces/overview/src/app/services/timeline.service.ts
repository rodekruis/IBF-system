import { Injectable } from '@angular/core';
import * as moment from 'moment';
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
  };

  constructor(private mapService: MapService, private apiService: ApiService) {
    this.state.countryCode = environment.defaultCountryCode;
    this.loadTimeStepButtons();
  }

  private async loadTimeStepButtons() {
    this.state.timeStepButtons = [
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
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(2, 'days')
          .format(this.state.dateFormat),
        value: '2-day',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(3, 'days')
          .format(this.state.dateFormat),
        value: '3-day',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(4, 'days')
          .format(this.state.dateFormat),
        value: '4-day',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(5, 'days')
          .format(this.state.dateFormat),
        value: '5-day',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(6, 'days')
          .format(this.state.dateFormat),
        value: '6-day',
        alert: false,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(7, 'days')
          .format(this.state.dateFormat),
        value: '7-day',
        alert: await this.getTrigger('7-day'),
        disabled: false,
      },
    ];
  }

  public handleTimeStepButtonClick(timeStepButtonValue) {
    this.state.selectedTimeStepButtonValue = timeStepButtonValue;
    this.mapService.loadData(this.state.selectedTimeStepButtonValue, undefined);
  }

  private async getTrigger(leadTime): Promise<any> {
    const trigger = await this.apiService.getTriggerPerLeadtime(
      this.state.countryCode,
      leadTime,
    );
    return trigger === 1;
  }
}
