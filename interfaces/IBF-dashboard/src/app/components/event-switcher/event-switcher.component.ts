import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { EventState } from 'src/app/types/event-state';
import { TimelineState } from 'src/app/types/timeline-state';
import { DisasterType } from '../../models/country.model';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { TimelineService } from '../../services/timeline.service';
import { LeadTime } from '../../types/lead-time';

@Component({
  selector: 'app-event-switcher',
  templateUrl: './event-switcher.component.html',
  styleUrls: ['./event-switcher.component.scss'],
})
export class EventSwitcherComponent implements OnInit, OnDestroy {
  public events: EventSummary[] = [];
  public selectedEventName: string;
  public eventState: EventState;
  public timelineState: TimelineState;

  private disasterTypeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;

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

  public multipleActiveEvents() {
    return (
      this.eventState?.events.filter((e: EventSummary) => e.activeTrigger)
        .length > 1
    );
  }

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    if (disasterType?.disasterType) {
      this.selectedEventName = this.eventState?.event?.eventName;
    }
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    if (timelineState.activeLeadTime) {
      this.selectedEventName = this.eventState?.events.find(
        (e) => e.firstLeadTime === timelineState.activeLeadTime,
      )?.eventName;
    }
  };

  public switchEvent(event: EventSummary): void {
    this.selectedEventName = event.eventName;
    if (this.timelineState.timeStepButtons?.length) {
      this.timelineService.handleTimeStepButtonClick(event.firstLeadTime);
      // Call eventService directly instead of via timelineService, to avoid cyclical dependency between event- and timeline service
      this.eventService.switchEvent(event.firstLeadTime as LeadTime);
    }
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };
}
