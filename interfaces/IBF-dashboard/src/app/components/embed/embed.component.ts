import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  standalone: false,
})
export class EmbedComponent implements OnInit, OnDestroy {
  public countryCodeISO3: string;
  public disasterTypeKey: DisasterTypeKey;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;

  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {}

  ngOnInit() {
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
    if (!country) {
      return;
    }

    this.country = country;

    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
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
}
