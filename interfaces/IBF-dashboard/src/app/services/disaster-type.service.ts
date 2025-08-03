import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';

@Injectable({ providedIn: 'root' })
export class DisasterTypeService {
  private disasterTypeSubject = new BehaviorSubject<DisasterType>(null);
  public disasterType: DisasterType;

  public getDisasterTypeSubscription = (): Observable<DisasterType> => {
    return this.disasterTypeSubject.asObservable();
  };

  public setDisasterType(disasterType: DisasterType) {
    this.disasterType = disasterType;
    this.disasterTypeSubject.next(this.disasterType);
  }

  public getCountryDisasterTypeSettings(
    country: Country,
    disasterType: DisasterType,
  ): CountryDisasterSettings {
    if (!country?.countryDisasterSettings || !disasterType?.disasterType) {
      return null;
    }
    return country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType.disasterType,
    );
  }
}
