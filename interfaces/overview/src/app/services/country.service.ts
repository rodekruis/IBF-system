import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Country } from 'src/app/models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new Subject<Country>();
  public selectedCountry: Country;
  public countries: Country[] = [];

  constructor() {
    this.countries = [
      {
        countryCode: 'UGA',
        countryName: 'Uganda',
        countryForecasts: ['7-day'],
      },
      {
        countryCode: 'ZMB',
        countryName: 'Zambia',
        countryForecasts: ['3-day', '7-day'],
      },
    ] as Country[];
  }

  getCountrySubscription(): Observable<Country> {
    return this.countrySubject.asObservable();
  }

  public selectCountry(countryCode) {
    this.selectedCountry = this.countries.find(
      (country) => country.countryCode == countryCode,
    );
    this.countrySubject.next(this.selectedCountry);
  }
}
