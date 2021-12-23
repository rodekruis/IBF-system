import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { VideoPopoverComponent } from 'src/app/components/video-popover/video-popover.component';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public version: string = environment.ibfSystemVersion;
  public country: Country;
  public countrySubscription: Subscription;
  public disasterTypes: string[] = [];
  public disasterTypeMap = DISASTER_TYPES_SVG_MAP;

  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    public countryService: CountryService,
  ) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.login);
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }
  private onCountryChange = (country: Country) => {
    this.disasterTypes = Object.keys(DISASTER_TYPES_SVG_MAP);
    this.country = country;
  };

  public getIconByCountry = (disasterType: string) => {
    if (!this.country) {
      return this.disasterTypeMap[disasterType].selectedNonTriggered;
    }
    const countryDisasterTypes = this.country?.disasterTypes.map(
      (item) => item.label,
    );
    if (countryDisasterTypes?.includes(disasterType)) {
      return this.disasterTypeMap[disasterType].selectedNonTriggered;
    } else {
      return this.disasterTypeMap[disasterType].nonSelectedNonTriggered;
    }
  };

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: VideoPopoverComponent,
      componentProps: {
        videoUrl: environment.ibfVideoGuideUrl,
      },
      animated: true,
      cssClass: 'ibf-video-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.watchVideoGuide, {
      page: AnalyticsPage.login,
      component: this.constructor.name,
    });

    popover.present();
  }
}
