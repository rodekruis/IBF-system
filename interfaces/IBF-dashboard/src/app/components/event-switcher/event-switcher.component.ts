import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisasterType } from 'src/app/models/country.model';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';

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
    return this.eventState?.events.length > 1;
  }

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterTypeName = disasterType.disasterType;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  public showLessButton() {
    return !this.eventService.skipNationalView(
      this.disasterTypeName as DisasterTypeKey,
    );
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
        (event.firstTriggerLeadTime || event.firstLeadTime) as LeadTime,
        event.eventName,
      );
    }
  }
}
