import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
  standalone: false,
})
export class CountrySwitcherComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  private lastCountryCode: string | null = null;
  public country: Country;

  constructor(public countryService: CountryService) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public handleCountryChange(event: any): void {
    const selectedCountryCode = event.detail.value;
    
    // Prevent duplicate calls
    if (this.lastCountryCode === selectedCountryCode) {
      console.log('🔄 Country change ignored - same country already selected:', selectedCountryCode);
      return;
    }

    console.log('🌍 Country change:', this.lastCountryCode, '->', selectedCountryCode);
    this.lastCountryCode = selectedCountryCode;

    const selectedCountry = this.countryService.countries.find(
      (country) => country.countryCodeISO3 === selectedCountryCode,
    );

    if (selectedCountry) {
      this.countryService.selectCountry(selectedCountryCode);
    } else {
      console.warn('⚠️ Country not found:', selectedCountryCode);
    }
  }
}
