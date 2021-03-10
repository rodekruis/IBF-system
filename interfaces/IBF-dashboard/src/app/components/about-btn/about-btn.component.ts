import { Component, Input, OnInit } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-about-btn',
  templateUrl: './about-btn.component.html',
  styleUrls: ['./about-btn.component.scss'],
})
export class AboutBtnComponent implements OnInit {
  @Input()
  public btnLabel: string;
  @Input()
  public color: string;

  constructor(
    private countryService: CountryService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  ngOnInit() {}

  public btnAction() {
    this.analyticsService.logEvent(AnalyticsEvent.aboutTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        window.open(country.eapLink);
      });
  }
}
