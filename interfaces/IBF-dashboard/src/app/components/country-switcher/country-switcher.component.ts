import { Component } from '@angular/core';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
})
export class CountrySwitcherComponent {
  constructor(public countryService: CountryService) {}

  public handleCountryChange($event) {
    this.countryService.selectCountry($event.detail.value);
  }
}
