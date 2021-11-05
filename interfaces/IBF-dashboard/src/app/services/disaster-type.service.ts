import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country, DisasterType } from '../models/country.model';
import { CountryService } from './country.service';

@Injectable({
  providedIn: 'root',
})
export class DisasterTypeService {
  private disasterTypeSubject = new BehaviorSubject<DisasterType>(null);
  public disasterType: DisasterType;
  public countryDisasterTypes: DisasterType[];
  private country: Country;

  constructor(private countryService: CountryService) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;

    if (this.country) {
      this.countryDisasterTypes = country.disasterTypes;
      this.disasterType = country.disasterTypes[0];
    }
  };

  getDisasterTypeSubscription = (): Observable<DisasterType> => {
    return this.disasterTypeSubject.asObservable();
  };

  public setDisasterType(disasterType: DisasterType) {
    this.disasterType = disasterType;
    this.disasterTypeSubject.next(this.disasterType);
  }
}
