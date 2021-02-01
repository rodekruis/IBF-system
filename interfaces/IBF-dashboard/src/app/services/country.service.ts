import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import mockCountry from 'src/app/mocks/country.mock';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  public activeCountry: Country = mockCountry;
  public countries: Country[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {
    this.getCountries();
  }

  public async getCountries(): Promise<void> {
    this.countries = await this.apiService.getCountries();
    this.filterCountriesForUser();
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  public selectCountry = (countryCodeISO3: string): void => {
    this.activeCountry = this.countries.find(
      (country) => country.countryCodeISO3 == countryCodeISO3,
    );
    this.countrySubject.next(this.activeCountry);
  };

  public filterCountriesForUser = (): void => {
    this.authService.authenticationState$.subscribe((user: User): void => {
      if (!user || !user.countries) {
        this.countries = [];
      } else {
        this.countries = this.countries.filter(
          (country) => user.countries.indexOf(country.countryCodeISO3) >= 0,
        );
        if (this.countries.length > 1) {
          this.selectCountry(this.countries[0].countryCodeISO3);
        }
      }
    });
  };
}
