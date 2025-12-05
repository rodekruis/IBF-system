import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  private countries: Country[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe(
      (params: { countryCodeISO3?: string }) => {
        if (params?.countryCodeISO3) {
          this.apiService.getCountries(null, true).subscribe((countries) => {
            this.countries = countries;
            this.selectCountry(params?.countryCodeISO3);
          });
        } else {
          this.authService.getAuthSubscription().subscribe(this.onUserChange);
        }
      },
    );
  }

  private onUserChange = (user: User) => {
    if (user) {
      this.getCountriesByUser(user);
    }
  };

  public getCountriesByUser(user: User): void {
    this.apiService
      .getCountries(user.countryCodesISO3)
      .subscribe(this.onCountriesByUser(user));
  }

  public getCountries(): Observable<Country[]> {
    return this.apiService.getCountries(null, true);
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  private onCountriesByUser = (user: User) => (countries: Country[]) => {
    this.countries = countries;
    this.filterCountriesByUser(user);
  };

  private filterCountryByCountryCodeISO3 =
    (countryCodeISO3: string) => (country: Country) =>
      country.countryCodeISO3 === countryCodeISO3;

  private filterCountryByUser = (user: User) => (country: Country) =>
    user.countryCodesISO3.includes(country.countryCodeISO3);

  public selectCountry = (countryCodeISO3: string): void => {
    this.countrySubject.next(
      this.countries.find(this.filterCountryByCountryCodeISO3(countryCodeISO3)),
    );
  };

  public filterCountriesByUser(user: User): void {
    if (!user?.countryCodesISO3) {
      this.countries = [];
    } else {
      this.countries = this.countries.filter(this.filterCountryByUser(user));
      if (this.countries.length > 0) {
        this.selectCountry(this.countries[0].countryCodeISO3);
      }
    }
  }
}
