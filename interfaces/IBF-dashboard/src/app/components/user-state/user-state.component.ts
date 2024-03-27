import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
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
import { ChangePasswordPopoverComponent } from '../change-password-popover/change-password-popover.component';

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
  public disasterType: DisasterType;
  public activeTriggerMsg: string;

  constructor(
    public authService: AuthService,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    public disasterTypeService: DisasterTypeService,
    public countryService: CountryService,
    public apiService: ApiService,
    private popoverController: PopoverController,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  private onCountryChange = (country: Country) => {
    if (country) {
      this.countryName = country.countryName;
    }
  };

  public showEnvironmentLabel(environmentConfiguration: string) {
    return environmentConfiguration === 'production'
      ? this.translateService.instant('login-page.environment-label.production')
      : environmentConfiguration === 'stage'
      ? this.translateService.instant('login-page.environment-label.stage')
      : environmentConfiguration;
  }

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    if (this.disasterType) {
      const eapNode = this.disasterTypeService.hasEap(
        this.disasterType.disasterType,
      );
      const yesNode = this.disasterType.activeTrigger ? 'yes' : 'no';

      this.translateService
        .get('dashboard-page.triggered-message')
        .subscribe((triggerTexts) => {
          this.activeTriggerMsg = triggerTexts[eapNode][yesNode];
        });
    }
  };

  public doLogout() {
    this.analyticsService.logEvent(AnalyticsEvent.logOut, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    this.loaderService.setLoader('logout', false);
    this.authService.logout();
    window.location.reload();
  }

  public async presentPopover() {
    const popover = await this.popoverController.create({
      component: ChangePasswordPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
        this.eventService.state.event?.thresholdReached
          ? 'trigger-alert'
          : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
    });

    popover.present();
  }
}
