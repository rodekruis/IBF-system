import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, EventSummary } from 'src/app/services/event.service';
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

  private disasterTypeSubscription: Subscription;
  private leadTimeSubscription: Subscription;

  constructor(
    private disasterTypeService: DisasterTypeService,
    public eventService: EventService,
    public timelineService: TimelineService,
  ) {}

  ngOnInit() {
    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.leadTimeSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe(this.onLeadTimeChange);
  }

  ngOnDestroy() {
    this.disasterTypeSubscription.unsubscribe();
    this.leadTimeSubscription.unsubscribe();
  }

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    if (disasterType.disasterType) {
      this.switchEvent(this.eventService.state.event);
    }
  };

  private onLeadTimeChange = (leadTime: LeadTime) => {
    if (leadTime) {
      this.selectedEventName = this.eventService.state.event?.eventName;
    }
  };

  public switchEvent(event: EventSummary): void {
    this.selectedEventName = event.eventName;
    if (this.timelineService.state.timeStepButtons.length) {
      this.timelineService.handleTimeStepButtonClick(event.firstLeadTime);
    }
    this.eventService.setEvent(event);
  }
}
