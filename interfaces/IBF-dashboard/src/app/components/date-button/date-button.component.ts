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
  public displayDate: string;
  public displayMonth: string;

  constructor() {}

  ngOnInit() {
    if (this.unit === LeadTimeUnit.day) {
      this.displayDate = this.date.toFormat(this.dateFormat);
    }
    this.displayMonth = this.date.toFormat(this.monthFormat);
  }
}
