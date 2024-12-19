import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

@Injectable({
  providedIn: 'root',
})
export class DisasterTypeService {
  private disasterTypeSubject = new BehaviorSubject<DisasterType>(null);
  public disasterType: DisasterType;

  private country: Country;

  constructor(private countryService: CountryService) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  public getDisasterTypeSubscription = (): Observable<DisasterType> => {
    return this.disasterTypeSubject.asObservable();
  };

  public setDisasterType(disasterType: DisasterType) {
    this.disasterType = disasterType;
    this.disasterTypeSubject.next(this.disasterType);
  }

  // TODO move to back-end
  public hasEap(disasterType: DisasterTypeKey): string {
    const eapDisasterTypes = [
      DisasterTypeKey.floods,
      DisasterTypeKey.drought,
      DisasterTypeKey.typhoon,
      DisasterTypeKey.flashFloods,
    ];
    return eapDisasterTypes.includes(disasterType) ? 'eap' : 'no-eap';
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public getCountryDisasterTypeSettings(
    country: Country,
    disasterType: DisasterType,
  ): CountryDisasterSettings {
    return country?.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType?.disasterType,
    );
  }
}
