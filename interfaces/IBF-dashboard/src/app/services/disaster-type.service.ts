import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisasterType } from '../models/country.model';
import { DisasterTypeKey } from '../types/disaster-type-key';

@Injectable({
  providedIn: 'root',
})
export class DisasterTypeService {
  private disasterTypeSubject = new BehaviorSubject<DisasterType>(null);
  public disasterType: DisasterType;

  constructor() {}

  getDisasterTypeSubscription = (): Observable<DisasterType> => {
    return this.disasterTypeSubject.asObservable();
  };

  public setDisasterType(disasterType: DisasterType) {
    this.disasterType = disasterType;
    this.disasterTypeSubject.next(this.disasterType);
  }

  public hasEap(disasterType: DisasterTypeKey): string {
    const eapDisasterTypes = [
      DisasterTypeKey.floods,
      DisasterTypeKey.drought,
      DisasterTypeKey.typhoon,
      DisasterTypeKey.flashFloods,
    ];
    return eapDisasterTypes.includes(disasterType) ? 'eap' : 'no-eap';
  }
}
