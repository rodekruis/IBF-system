import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Country, DisasterType } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-state',
  templateUrl: './user-state.component.html',
  styleUrls: ['./user-state.component.scss'],
})
export class UserStateComponent implements OnInit {
  @Input()
  public isLoggedIn: boolean;

  public environmentConfiguration = environment.configuration;

  public displayName: string;
  public countryName: string;
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
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    if (!this.countryName) {
      this.apiService.getCountries().subscribe((countries) => {
        if (countries.length === 1) {
          this.onCountryChange(countries[0]);
        }
      });
    }
  }

  private onCountryChange = (country: Country) => {
    this.countryName =
      country?.countryName ||
      this.capitalizeFirstLetter(this.environmentConfiguration);
  };

  private capitalizeFirstLetter(toCapitalize: string) {
    return toCapitalize.charAt(0).toUpperCase() + toCapitalize.slice(1);
  }

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
