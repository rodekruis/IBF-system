import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { VideoPopoverComponent } from 'src/app/components/video-popover/video-popover.component';
import { Country, DisasterType } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { environment } from 'src/environments/environment';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public version: string = environment.ibfSystemVersion;
  public country: Country;
  public countrySubscription: Subscription;
  public disasterTypes: DisasterType[] = [];
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
    this.countryService.getAllCountries().subscribe(this.onGetAllCountries)
  }
  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public getIconByCountry = (disasterType: DisasterType) => {
    if (this.country?.disasterTypes?.includes(disasterType)) {
      return this.disasterTypeMap[disasterType?.disasterType].selectedNonTriggered
    } else {
      return this.disasterTypeMap[disasterType?.disasterType].nonSelectedNonTriggered
    }
  }

  private onGetAllCountries = (countries: Country[]) => {
    countries.forEach((country: Country) => {  
      country.disasterTypes.forEach((disasterType : DisasterType) => {
        const isExist = this.disasterTypes.find((item) => item.label === disasterType.label)
        if(!isExist) {
          this.disasterTypes.push(disasterType)
        }
      })
    })
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
