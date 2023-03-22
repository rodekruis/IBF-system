import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country, DisasterType } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { DisasterTypeService } from '../../services/disaster-type.service';

@Component({
  selector: 'app-about-btn',
  templateUrl: './about-btn.component.html',
  styleUrls: ['./about-btn.component.scss'],
})
export class AboutBtnComponent implements OnDestroy {
  @Input()
  public btnLabel: string;

  private country: Country;
  private countrySubscription: Subscription;
  private disasterType: DisasterType;
  private disasterTypeSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
  };

  public btnAction() {
    this.analyticsService.logEvent(AnalyticsEvent.aboutTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    if (this.country && this.disasterType) {
      window.open(
        this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        ).eapLink,
      );
    }
  }
}
