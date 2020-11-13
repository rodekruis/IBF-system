import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import mockCountry from 'src/app/mocks/country.mock';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user.model';
import { AdminLevel } from 'src/app/types/admin-level.enum';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new ReplaySubject<Country>();
  public selectedCountry: Country = mockCountry;
  public countries: Country[] = [];

  constructor() {
    this.countries = [
      {
        countryCode: 'UGA',
        defaultAdminLevel: AdminLevel.adm2,
        countryName: 'Uganda',
        countryForecasts: ['7-day'],
        adminRegionLabels: ['Regions', 'Districts', 'Counties', 'Parishes'],
      },
      {
        countryCode: 'ZMB',
        defaultAdminLevel: AdminLevel.adm2,
        countryName: 'Zambia',
        countryForecasts: ['3-day', '7-day'],
        adminRegionLabels: ['Provinces', 'Districts', 'Wards'],
      },
    ] as Country[];
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  public selectCountry = (countryCode): void => {
    this.selectedCountry = this.countries.find(
      (country) => country.countryCode == countryCode,
    );
    this.countrySubject.next(this.selectedCountry);
  };

  public filterCountriesForUser = (user: User): void => {
    if (!user || !user.countries) {
      this.countries = [];
    } else {
      this.countries = this.countries.filter(
        (country) => user.countries.indexOf(country.countryCode) >= 0,
      );
      this.selectCountry(this.countries[0].countryCode);
    }
  };
}
