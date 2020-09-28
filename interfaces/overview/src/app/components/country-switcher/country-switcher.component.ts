import { Component } from '@angular/core';
import { CountryService } from 'src/app/services/country.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
})
export class CountrySwitcherComponent {
  constructor(public countryService: CountryService) {
    this.countryService.selectCountry(environment.defaultCountryCode);
  }

  public handleCountryChange($event) {
    this.countryService.selectCountry($event.detail.value);
  }
}
