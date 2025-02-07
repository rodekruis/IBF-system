import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { DateFormats, MonthFormats } from 'src/app/types/lead-time';
@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
  standalone: false,
})
export class DateButtonComponent implements OnInit, OnDestroy {
  @Input() date = DateTime.now();
  @Input() active: boolean;
  @Input() alert: boolean;
  @Input() thresholdReached: boolean;
  @Input() eventName: null | string;
  @Input() duration: null | number;

  private dateFormat = '';
  private monthFormat = '';
  private hourFormat = 'HH:00 a';
  public firstLine: string;
  public secondLine: string;
  public thirdLine: string;

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

  private onTimelineStateChange = () => {
    const disasterType = this.disasterTypeService?.disasterType?.disasterType;

    this.dateFormat = DateFormats[disasterType] || DateFormats.default;
    this.monthFormat = MonthFormats[disasterType] || MonthFormats.default;
    if (
      [DisasterTypeKey.flashFloods, DisasterTypeKey.floods].includes(
        disasterType,
      )
    ) {
      this.firstLine = this.date.toFormat(this.dateFormat);
    }

    this.secondLine = this.date
      ? this.date.toFormat(this.monthFormat)
      : 'Undetermined';

    if (
      this.eventName &&
      this.duration &&
      disasterType === DisasterTypeKey.drought
    ) {
      const endMonthDate = this.date.plus({ months: this.duration - 1 });
      let displayMonth = this.date.monthShort;
      if (this.duration > 1) {
        displayMonth = `${displayMonth}-${endMonthDate.monthShort}`;
      }
      this.secondLine = `${displayMonth} ${endMonthDate.year.toString()}`;
    }

    // Refactor: I combined all code that sets thirdLine into one if-statement to avoid confusion. But basically this whole file is one big mess, which fills all 3 lines very hackily.
    if (disasterType === DisasterTypeKey.typhoon) {
      if (this.active) {
        this.thirdLine = this.date
          ? this.date.toFormat(this.hourFormat)
          : 'Landfall';
      }
    } else if (
      this.eventName &&
      this.duration &&
      disasterType === DisasterTypeKey.drought
    ) {
      this.thirdLine = `Duration ${this.duration.toString()} months`;
    } else {
      this.thirdLine = '';
    }
  };
}
