import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { LeadTimeUnit } from 'src/app/types/lead-time';

@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
})
export class DateButtonComponent implements OnInit {
  @Input() date = DateTime.now();
  @Input() unit = LeadTimeUnit.day;

  private dateFormat = 'ccc dd';
  private monthFormat = 'LLL yyyy';
  private hourFormat = 'HH:mm dd ccc';
  public displayDate: string;
  public displayMonth: string;
  public displayHour: string;


  constructor() {}

  ngOnInit() {
    if (this.unit === LeadTimeUnit.day) {
      this.displayDate = this.date.toFormat(this.dateFormat);
    }
    if (this.unit === LeadTimeUnit.hour) {
      this.displayHour = this.date.toFormat(this.hourFormat);
    }
    this.displayMonth = this.date.toFormat(this.monthFormat);
  }
}
