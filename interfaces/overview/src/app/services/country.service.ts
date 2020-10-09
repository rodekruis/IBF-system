import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import mockCountry from 'src/app/mocks/country.mock';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new Subject<Country>();
  public selectedCountry: Country = mockCountry;
  public countries: Country[] = [];

  constructor() {
    this.countries = [
      {
        countryCode: 'UGA',
        defaultAdminLevel: 2,
        countryName: 'Uganda',
        countryForecasts: ['7-day'],
      },
      {
        countryCode: 'ZMB',
        defaultAdminLevel: 2,
        countryName: 'Zambia',
        countryForecasts: ['3-day', '7-day'],
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
