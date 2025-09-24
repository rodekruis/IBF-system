import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

@Injectable({ providedIn: 'root' })
export class DisasterTypeService {
  private disasterTypeSubject = new BehaviorSubject<DisasterType>(null);
  public disasterType: DisasterType;
  private disasterTypeKey: DisasterTypeKey;
  private country: Country;

  constructor(
    private activatedRoute: ActivatedRoute,
    private countryService: CountryService,
  ) {
    this.activatedRoute.queryParams.subscribe(this.onRouteChange);

    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  private onRouteChange = (params: Params) => {
    if (params?.['disasterType']) {
      this.disasterTypeKey = params?.['disasterType'] as DisasterTypeKey;
    }
  };

  private onCountryChange = (country: Country) => {
    if (!country) {
      return;
    }

    this.country = country;

    // using setTimeout to ensure this runs after the country change has fully propagated
    setTimeout(() => {
      if (this.disasterTypeKey) {
        this.setDisasterType(
          this.country.disasterTypes.find(
            (dt) => dt.disasterType === this.disasterTypeKey,
          ),
        );
      }
    }, 0);
  };

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
    return country?.countryDisasterSettings.find(
      (countryDisasterSetting) =>
        countryDisasterSetting.disasterType === disasterType?.disasterType,
    );
  }
}
