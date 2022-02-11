import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { EventService } from 'src/app/services/event.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  private timelineStateSubscription: Subscription;
  public timelineState: TimelineState;

  constructor(
    public timelineService: TimelineService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}
  ngOnInit(): void {
    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }
  ngOnDestroy(): void {
    this.timelineStateSubscription.unsubscribe();
  }

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

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };
}
