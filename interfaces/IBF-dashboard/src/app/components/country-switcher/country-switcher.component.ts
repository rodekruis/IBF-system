import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
})
export class CountrySwitcherComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  public country: Country;

  constructor(public countryService: CountryService) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (country) {
          this.country = country;
        }
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  public handleCountryChange($event) {
    this.countryService.selectCountry($event.detail.value);
  }
}
