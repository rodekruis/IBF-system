import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class AboutBtnComponent implements OnDestroy {
  @Input()
  public btnLabel: string;
  @Input()
  public color: string;

  private country: Country;
  private countrySubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.country = country;
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  public btnAction() {
    this.analyticsService.logEvent(AnalyticsEvent.aboutTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    if (this.country) {
      window.open(this.country.eapLink);
    }
  }
}
