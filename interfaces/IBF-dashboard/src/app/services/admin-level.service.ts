import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level';
import { Country } from '../models/country.model';
import { CountryService } from './country.service';

@Injectable({
  providedIn: 'root',
})
export class AdminLevelService {
  private adminLevelSubject = new BehaviorSubject<AdminLevel>(AdminLevel.adm1);
  public adminLevel: AdminLevel;
  public adminLevelLabel: AdminLevelLabel = new AdminLevelLabel();
  public adminLayerState = true;
  private country: Country;

  private static loadAdminLevelLabels(country: Country): AdminLevelLabel {
    return {
      adm1: country.adminRegionLabels[1].plural,
      adm2: country.adminRegionLabels[2].plural,
      adm3: country.adminRegionLabels[3].plural,
      adm4: country.adminRegionLabels[4].plural,
    };
  }

  constructor(private countryService: CountryService) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;

    if (this.country) {
      this.setAdminLevel(this.country.defaultAdminLevel);
      this.adminLevelLabel = AdminLevelService.loadAdminLevelLabels(
        this.country,
      );
    }
  };

  getAdminLevelSubscription = (): Observable<AdminLevel> => {
    return this.adminLevelSubject.asObservable();
  };

  public setAdminLevel(adminLevel: AdminLevel) {
    this.adminLevel = adminLevel;
    this.adminLevelSubject.next(this.adminLevel);
  }
}
