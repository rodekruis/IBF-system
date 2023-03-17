import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { PlaceCode } from '../../models/place-code.model';
import { PlaceCodeService } from '../../services/place-code.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  private timelineStateSubscription: Subscription;
  private placeCodeHoverSubscription: Subscription;

  public timelineState: TimelineState;
  public placeCodeHover: PlaceCode;

  constructor(
    public timelineService: TimelineService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);
  }

  ngOnDestroy(): void {
    this.timelineStateSubscription.unsubscribe();
    this.placeCodeHoverSubscription.unsubscribe();
  }

  handleTimeStepButtonClick(leadTime: LeadTime, eventName: string) {
    this.analyticsService.logEvent(AnalyticsEvent.leadTime, {
      page: AnalyticsPage.dashboard,
      leadTime,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    // Only trigger event-switch if there are multiple events
    if (this.eventService.state.events.length > 1) {
      // Call eventService directly instead of via timelineService, to avoid cyclical dependency between event- and timeline service
      const clickedEvent = this.eventService.state.events.find(
        (e) => e.firstLeadTime === leadTime && e.eventName === eventName,
      );
      this.eventService.switchEvent(clickedEvent.eventName);
      this.timelineService.handleTimeStepButtonClick(
        leadTime,
        clickedEvent.eventName,
      );
    } else {
      // if single event, then just switch lead-time
      this.timelineService.handleTimeStepButtonClick(leadTime);
    }
  }

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  private onPlaceCodeHoverChange = (placeCode: PlaceCode) => {
    this.placeCodeHover = placeCode;
    if (!this.eventService.state.event) {
      if (this.placeCodeHover) {
        const btn = this.timelineState?.timeStepButtons?.find(
          (t) => t.eventName === placeCode.eventName,
        );
        if (btn) {
          btn.active = true;
        }

        this.changeDetectorRef.detectChanges();
      } else {
        if (this.timelineState?.timeStepButtons) {
          for (const btn of this.timelineState.timeStepButtons) {
            btn.active = false;
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  };
}
