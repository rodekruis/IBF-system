import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { CountryService } from 'src/app/services/country.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
})
export class CountrySwitcherComponent {
  constructor(
    public countryService: CountryService,
    private authService: AuthService,
  ) {
    this.countryService.selectCountry(environment.defaultCountryCode);
    this.authService.authenticationState$.subscribe(
      this.countryService.filterCountriesForUser,
    );
  }

  public handleCountryChange($event) {
    this.countryService.selectCountry($event.detail.value);
  }
}
