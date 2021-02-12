import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import mockCountry from 'src/app/mocks/country.mock';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  public activeCountry: Country;
  public countries: Country[] = [];
  public countryLocalStorage = 'country';

  constructor(private apiService: ApiService) {}

  public async getCountries(user: User): Promise<void> {
    this.countries = await this.apiService.getCountries();
    this.filterCountriesForUser(user);
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  public selectCountry = (countryCodeISO3: string): void => {
    this.activeCountry = this.countries.find(
      (country) => country.countryCodeISO3 == countryCodeISO3,
    );
    localStorage.setItem(
      this.countryLocalStorage,
      JSON.stringify(this.activeCountry),
    );
    this.countrySubject.next(this.activeCountry);
  };

  public filterCountriesForUser(user: User): void {
    if (!user || !user.countries) {
      this.countries = [];
    } else {
      this.countries = this.countries.filter(
        (country) => user.countries.indexOf(country.countryCodeISO3) >= 0,
      );
      if (this.countries.length > 0) {
        this.selectCountry(this.countries[0].countryCodeISO3);
      }
    }
  }

  public getActiveCountry(): Country {
    const countryString = localStorage.getItem(this.countryLocalStorage);
    if (countryString) {
      return JSON.parse(countryString);
    }
    return mockCountry;
  }
}
