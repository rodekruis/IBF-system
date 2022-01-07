import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { AuthService } from '../auth/auth.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  public countries: Country[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {
    this.authService.getAuthSubscription().subscribe(this.onUserChange);
  }

  private onUserChange = (user: User) => {
    if (user) {
      this.getCountriesByUser(user);
    }
  };

  public getCountriesByUser(user: User): void {
    this.apiService.getCountries().subscribe(this.onCountriesByUser(user));
  }

  public getAllCountries(): Observable<Country[]> {
    return this.apiService.getCountries();
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  private onCountriesByUser = (user) => (countries) => {
    this.countries = countries;
    this.filterCountriesByUser(user);
  };

  // private onGetAllCountries = () => (countries) => {
  //   this.countries = countries;
  // };

  private filterCountryByCountryCodeISO3 = (countryCodeISO3) => (country) =>
    country.countryCodeISO3 === countryCodeISO3;

  private filterCountryByUser = (user: User) => (country) =>
    user.countries.indexOf(country.countryCodeISO3) >= 0;

  public selectCountry = (countryCodeISO3: string): void => {
    this.countrySubject.next(
      this.countries.find(this.filterCountryByCountryCodeISO3(countryCodeISO3)),
    );
  };

  public filterCountriesByUser(user: User): void {
    if (!user || !user.countries) {
      this.countries = [];
    } else {
      this.countries = this.countries.filter(this.filterCountryByUser(user));
      if (this.countries.length > 0) {
        this.selectCountry(this.countries[0].countryCodeISO3);
      }
    }
  }
}
