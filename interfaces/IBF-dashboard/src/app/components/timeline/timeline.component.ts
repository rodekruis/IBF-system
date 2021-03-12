import { Component } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { EventService } from 'src/app/services/event.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  constructor(
    public timelineService: TimelineService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  handleTimeStepButtonClick(leadTime: LeadTime) {
    this.analyticsService.logEvent(AnalyticsEvent.leadTime, {
      page: AnalyticsPage.dashboard,
      leadTime,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.timelineService.handleTimeStepButtonClick(leadTime);
  }
}
