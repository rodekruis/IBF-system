import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { EventState } from 'src/app/types/event-state';
import { TimelineState } from 'src/app/types/timeline-state';
import { DisasterType } from '../../models/country.model';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { TimelineService } from '../../services/timeline.service';
import { DisasterTypeKey } from '../../types/disaster-type-key';
import { LeadTime } from '../../types/lead-time';

@Component({
  selector: 'app-event-switcher',
  templateUrl: './event-switcher.component.html',
  styleUrls: ['./event-switcher.component.scss'],
})
export class EventSwitcherComponent implements OnInit, OnDestroy {
  public selectedEventName: string;
  public eventState: EventState;
  public timelineState: TimelineState;
  public disasterTypeName: string;

  private disasterTypeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;

  @Input()
  public event: EventSummary;

  constructor(
    private disasterTypeService: DisasterTypeService,
    public eventService: EventService,
    public timelineService: TimelineService,
  ) {}

  ngOnInit() {
    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }

  ngOnDestroy() {
    this.disasterTypeSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
    this.timelineStateSubscription.unsubscribe();
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.selectedEventName = this.eventState?.event?.eventName;
  };

  public multipleActiveEvents() {
    return (
      this.eventState?.events.filter((e: EventSummary) => e.activeTrigger)
        .length > 1
    );
  }

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterTypeName = disasterType.disasterType;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    if (timelineState.activeLeadTime) {
      // first get eventName directly ..
      this.selectedEventName = timelineState.timeStepButtons.find(
        (t) => t.active,
      ).eventName;
      // .. if not available, find based on leadTime
      if (!this.selectedEventName) {
        this.selectedEventName = this.eventState?.events.find(
          (e) => e.firstLeadTime === timelineState.activeLeadTime,
        )?.eventName;
      }

      if (this.eventState.events.length > 1) {
        // Only trigger event-switch if there are multiple events
        this.eventService.switchEvent(this.selectedEventName);
      }
    }
  };

  public showLessButton() {
    return this.disasterTypeName !== DisasterTypeKey.typhoon;
  }

  public switchEvent(event: EventSummary): void {
    if (this.selectedEventName === event.eventName) {
      this.eventService.resetEvents();
      return;
    }

    this.selectedEventName = event.eventName;

    if (this.timelineState.timeStepButtons?.length) {
      // Call eventService directly instead of via timelineService, to avoid cyclical dependency between event- and timeline service
      this.eventService.switchEvent(event.eventName);

      this.timelineService.handleTimeStepButtonClick(
        event.firstLeadTime as LeadTime,
        event.eventName,
      );
    }
  }

  public getColor(event: EventSummary): string {
    return event.thresholdReached
      ? 'ibf-trigger-alert-secondary'
      : 'ibf-no-alert-secondary';
  }
}
