import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  public version: string = environment.ibfSystemVersion;
  public isDev = false;
  public isMultiCountry = false;
  public environmentConfiguration = environment.configuration;
  public userRole: UserRole;
  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;

  private adminRole = UserRole.Admin;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    this.authService.getAuthSubscription().subscribe(this.onUserChange);
    this.analyticsService.logPageView(AnalyticsPage.dashboard);

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

  private onUserChange = (user: User): void => {
    if (!user) {
      return;
    }

    this.isDev = user.userRole === this.adminRole;
    this.isMultiCountry = user.countries.length > 1;
    this.userRole = user.userRole;
  };

  private onCountryChange = (country: Country) => {
    if (!country) {
      return;
    }

    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    if (!disasterType) {
      return;
    }

    this.disasterType = disasterType;

    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
  };

  public getTodayDate(): Date {
    return DateTime.now().toJSDate();
  }
}
