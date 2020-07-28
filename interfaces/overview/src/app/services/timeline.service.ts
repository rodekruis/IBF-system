import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { MapService } from 'src/app/services/map.service';

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

  constructor(private mapService: MapService) {
    this.loadTimeStepButtons();
  }

  private loadTimeStepButtons() {
    this.state.timeStepButtons = [
      {
        dateString: this.state.today.format(this.state.dateFormat),
        value: '0-day',
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
        alert: true,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(3, 'days')
          .format(this.state.dateFormat),
        value: '3-day',
        alert: true,
        disabled: true,
      },
      {
        dateString: this.state.today
          .clone()
          .add(4, 'days')
          .format(this.state.dateFormat),
        value: '4-day',
        alert: true,
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
        alert: false,
        disabled: false,
      },
    ];
  }

  private handleTimeStepButtonClick(timeStepButtonValue) {
    this.state.selectedTimeStepButtonValue = timeStepButtonValue;
    this.mapService.loadData(this.state.selectedTimeStepButtonValue, undefined);
  }
}
