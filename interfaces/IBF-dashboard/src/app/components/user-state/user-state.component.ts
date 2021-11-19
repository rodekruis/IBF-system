import { Component, OnInit } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { CountryService } from 'src/app/services/country.service';
import { Country,DisasterType } from 'src/app/models/country.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-state',
  templateUrl: './user-state.component.html',
  styleUrls: ['./user-state.component.scss'],
})
export class UserStateComponent implements OnInit {
  public displayName: string;
  public country: Country;
  public countrySubscription: Subscription;
  public disasterTypeSubscription: Subscription;
  public disasterType: string;

  constructor(
    public authService: AuthService,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    public disasterTypeService: DisasterTypeService,
    public countryService: CountryService,
  ) {
  }

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
      this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType?.disasterType;
  };

  public doLogout() {
    this.analyticsService.logEvent(AnalyticsEvent.logOut, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.loaderService.setLoader('logout', false);
    this.authService.logout();
    window.location.reload();
  }
}
