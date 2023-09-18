import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-timestamp',
  templateUrl: './timestamp.component.html',
  styleUrls: ['./timestamp.component.scss'],
})
export class TimestampComponent implements OnInit {
  @Input()
  public timestamp: DateTime = DateTime.now();

  private dateFormat = 'cccc, dd LLLL';
  private timeFormat = 'HH:mm';
  public displayDate: string;
  public displayTime: string;

  ngOnInit() {
    this.displayDate = this.timestamp?.toFormat(this.dateFormat);
    this.displayTime = this.timestamp?.toFormat(this.timeFormat);
  }
}
