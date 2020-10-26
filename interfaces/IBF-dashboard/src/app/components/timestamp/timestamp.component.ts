import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-timestamp',
  templateUrl: './timestamp.component.html',
  styleUrls: ['./timestamp.component.scss'],
})
export class TimestampComponent implements OnInit {
  public date: string;
  public time: string;

  constructor() {}

  ngOnInit() {
    this.date = moment().format('dddd, D MMMM');
    this.time = moment().format('HH:mm');
  }
}
