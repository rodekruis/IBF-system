import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
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
  standalone: false,
})
export class LoginPage implements OnInit, OnDestroy {
  public version: string = environment.ibfSystemVersion;
  public country: Country;
  public countrySubscription: Subscription;
  public envDisasterTypes: string[] = [];
  public allDisasterTypes: string[] = [];
  public disasterTypeMap = DISASTER_TYPES_SVG_MAP;
  public environmentConfiguration = environment.configuration;
  
  private countriesSubscription: Subscription;
  private analyticsLogged = false; // Prevent multiple analytics calls

  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    public countryService: CountryService,
  ) {}

  ngOnInit() {
    // Only log analytics once to prevent infinite loops
    if (!this.analyticsLogged) {
      this.analyticsService.logPageView(AnalyticsPage.login);
      this.analyticsLogged = true;
    }
    
    this.allDisasterTypes = Object.keys(DISASTER_TYPES_SVG_MAP);
    
    // Use take(1) to prevent repeated subscriptions and API calls
    this.countriesSubscription = this.countryService.getAllCountries()
      .pipe(take(1))
      .subscribe(this.onGetAllCountries);
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    if (this.countriesSubscription) {
      this.countriesSubscription.unsubscribe();
    }
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
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
      cssClass: 'ibf-popover ibf-popover-large',
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
