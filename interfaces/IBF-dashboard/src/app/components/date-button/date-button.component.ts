import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class DateButtonComponent implements OnInit, OnDestroy, OnChanges {
  @Input() date = DateTime.now();
  @Input() forecastAlert: boolean;
  @Input() trigger: boolean;

  private dateFormat = '';
  private monthFormat = '';
  private hourFormat = 'HH:00';
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

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    if (changes['date'] || changes['forecastAlert'] || changes['trigger']) {
      this.onTimelineStateChange();
    }
  }

  ngOnDestroy() {
    this.timelineStateSubscription.unsubscribe();
  }

  // REFACTOR: the setup of this file is hacky and messy
  private onTimelineStateChange = () => {
    const disasterType = this.disasterTypeService?.disasterType?.disasterType;

    this.dateFormat = DateFormats[disasterType] || DateFormats.default;
    this.monthFormat = MonthFormats[disasterType] || MonthFormats.default;

    if (disasterType === DisasterTypeKey.floods) {
      this.firstLine = this.date.toFormat(this.dateFormat);
    }

    this.secondLine = this.date
      ? this.date.toFormat(this.monthFormat)
      : 'Undetermined';

    if (
      disasterType === DisasterTypeKey.typhoon ||
      disasterType === DisasterTypeKey.flashFloods
    ) {
      if (this.forecastAlert) {
        this.thirdLine = this.date
          ? this.date.toFormat(this.hourFormat)
          : disasterType === DisasterTypeKey.typhoon
            ? 'Landfall'
            : '';
      }
    } else {
      this.thirdLine = '';
    }
  };
}
