import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import {
  DateFormats,
  LeadTimeUnit,
  MonthFormats,
} from 'src/app/types/lead-time';
import { TimelineService } from '../../services/timeline.service';
import { TimelineState } from '../../types/timeline-state';

@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
})
export class DateButtonComponent implements OnInit, OnDestroy {
  @Input() date = DateTime.now();
  @Input() unit = LeadTimeUnit.day;
  @Input() active: boolean;
  @Input() todayButton: boolean;
  @Input() eventName: string | null;
  @Input() duration: number | null;

  private dateFormat = '';
  private monthFormat = '';
  private hourFormat = 'HH:00 a';
  public displayDate: string;
  public displayMonth: string;
  public displayHour: string;

  private timelineStateSubscription: Subscription;

  constructor(
    public disasterTypeService: DisasterTypeService,
    private timelineService: TimelineService,
  ) {}

  ngOnInit() {
    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }

  ngOnDestroy() {
    this.timelineStateSubscription.unsubscribe();
  }

  private onTimelineStateChange = (timelineState: TimelineState) => {
    if (this.todayButton) {
      this.date = timelineState.today;
    }

    this.dateFormat =
      DateFormats[this.disasterTypeService?.disasterType?.disasterType] ||
      DateFormats.default;
    this.monthFormat =
      MonthFormats[this.disasterTypeService?.disasterType?.disasterType] ||
      MonthFormats.default;
    if (this.unit === LeadTimeUnit.day) {
      this.displayDate = this.date.toFormat(this.dateFormat);
    }
    if (this.unit === LeadTimeUnit.hour) {
      if (this.active) {
        this.displayHour = this.date
          ? this.date.toFormat(this.hourFormat)
          : 'Landfall';
      } else {
        this.displayHour = '';
      }
    }
    this.displayMonth = this.date
      ? this.date.toFormat(this.monthFormat)
      : 'Undetermined';

    console.log('this.duration: ', this.duration);
    // TO DO: remove this. Put in for now just to be able to distinguish timeline-buttons per event.
    if (this.eventName && this.duration && this.unit === LeadTimeUnit.month) {
      this.displayHour = `Duration ${this.duration} months`;
    }
  };
}
