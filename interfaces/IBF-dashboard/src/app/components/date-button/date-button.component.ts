import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
})
export class DateButtonComponent implements OnInit {
  @Input() date = DateTime.now();

  private dateFormat = 'ccc dd';
  private monthFormat = 'LLL yyyy';
  public displayDate: string;
  public displayMonth: string;

  constructor() {}

  ngOnInit() {
    this.displayDate = this.date.toFormat(this.dateFormat);
    this.displayMonth = this.date.toFormat(this.monthFormat);
  }
}
