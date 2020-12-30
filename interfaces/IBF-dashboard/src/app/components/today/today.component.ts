import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent {
  private today: moment.Moment = moment();
  private dateFormat: string = 'ddd DD';
  private monthFormat: string = 'MMM YYYY';
  public displayDate: string;
  public displayMonth: string;

  constructor() {
    this.displayDate = this.today.format(this.dateFormat);
    this.displayMonth = this.today.format(this.monthFormat);
  }
}
