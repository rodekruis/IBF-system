import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;

  constructor(
    private countryService: CountryService,
    public timelineService: TimelineService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        await this.timelineService.loadTimeStepButtons();
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  handleTimeStepButtonClick(leadTime: LeadTime) {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.leadTime, {
          page: AnalyticsPage.dashboard,
          leadTime: leadTime,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
        });
      });

    this.timelineService.handleTimeStepButtonClick(leadTime);
  }
}
