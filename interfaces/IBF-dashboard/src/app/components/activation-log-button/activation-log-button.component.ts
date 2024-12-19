import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Country, DisasterType } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';

@Component({
  selector: 'app-activation-log-button',
  templateUrl: './activation-log-button.component.html',
  styleUrls: ['./activation-log-button.component.scss'],
})
export class ActivationLogButtonComponent implements OnDestroy {
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private country: Country;
  private disasterType: DisasterType;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private router: Router,
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

  public goToPage() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/log`], {
        queryParams: {
          countryCodeISO3: this.country.countryCodeISO3,
          disasterType: this.disasterType.disasterType,
        },
      }),
    );
    window.open(url, '_blank');
  }

  public getEapKey(): string {
    if (!this.disasterType) {
      return 'trigger';
    }
    return this.disasterTypeService.hasEap(this.disasterType.disasterType) ===
      'eap'
      ? 'trigger'
      : 'alert';
  }
}
