import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';
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
  private readonly adminRole = UserRole.Admin;
  public environmentConfiguration = environment.configuration;
  public userRole: UserRole;
  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;

  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private analyticsService: AnalyticsService,
    private popoverController: PopoverController,
  ) {
    this.authService.getAuthSubscription().subscribe(this.onUserChange);

    if (!this.isPhone() && !this.isTablet()) {
      return;
    }

    if (this.isTablet() && screen.orientation.type.includes('landscape')) {
      return;
    }

    this.showScreenOrientationPopover();
  }

  ngOnInit() {
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

  private isTablet(): boolean {
    return /ipad|tablet|android(?!.*mobile)|windows(?!.*phone).*touch|kindle|playbook|silk|puffin(?!.*(?:IP|AP|WP))/.test(
      navigator.userAgent.toLowerCase(),
    );
  }

  private isPhone(): boolean {
    return /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(?:hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(?:ob|in)i|palm(?: os)?|phone|p(?:ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(?:browser|link)|vodafone|wap|windows (?:ce|phone)|xda|xiino/i.test(
      navigator.userAgent.toLowerCase(),
    );
  }

  private async showScreenOrientationPopover() {
    const popover = await this.popoverController.create({
      component: ScreenOrientationPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ${this.isTablet() ? 'ibf-popover-normal' : ''}`,
      translucent: true,
      showBackdrop: true,
      componentProps: { device: this.isPhone() ? 'mobile' : 'tablet' },
    });

    await popover.present();
  }

  public getTodayDate(): Date {
    return DateTime.now().toJSDate();
  }
}
