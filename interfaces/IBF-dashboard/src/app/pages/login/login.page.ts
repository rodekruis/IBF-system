import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { IbfGuidePopoverComponent } from 'src/app/components/ibf-guide-popover/ibf-guide-popover.component';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { Country, DisasterType } from 'src/app/models/country.model';
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
  public envDisasterTypes: string[] = [];
  public allDisasterTypes: string[] = [];
  public disasterTypeMap = DISASTER_TYPES_SVG_MAP;
  public environmentConfiguration = environment.configuration;

  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    public countryService: CountryService,
  ) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.login);

    this.allDisasterTypes = Object.keys(DISASTER_TYPES_SVG_MAP);
    this.countryService.getAllCountries().subscribe(this.onGetAllCountries);
  }

  public getIconByCountry = (disasterType: string) => {
    if (this.envDisasterTypes?.includes(disasterType)) {
      return this.disasterTypeMap[disasterType].selectedNonTriggered;
    } else {
      return this.disasterTypeMap[disasterType].disabled;
    }
  };

  private onGetAllCountries = (countries: Country[]) => {
    countries.forEach((country: Country) => {
      country.disasterTypes.forEach((disasterType: DisasterType) => {
        const isExist = this.envDisasterTypes.find(
          (item) => item === disasterType.disasterType,
        );
        if (!isExist) {
          this.envDisasterTypes.push(disasterType.disasterType);
        }
      });
    });
  };

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: IbfGuidePopoverComponent,
      componentProps: {
        videoUrl: environment.ibfVideoGuideUrl,
        pdfUrl: environment.ibfPdfGuideUrl,
      },
      animated: true,
      cssClass: 'ibf-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.watchIbfGuide, {
      page: AnalyticsPage.login,
      component: this.constructor.name,
    });

    popover.present();
  }
}
