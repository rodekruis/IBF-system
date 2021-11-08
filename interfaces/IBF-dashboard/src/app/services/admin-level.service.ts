import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level';
import { Country, DisasterType } from '../models/country.model';
import { IbfLayerName } from '../types/ibf-layer';
import { CountryService } from './country.service';
import { DisasterTypeService } from './disaster-type.service';

@Injectable({
  providedIn: 'root',
})
export class AdminLevelService {
  private adminLevelSubject = new BehaviorSubject<AdminLevel>(
    AdminLevel.adminLevel1,
  );
  public oldAdminLevel: AdminLevel = null;
  public adminLevel: AdminLevel;
  public countryAdminLevels: AdminLevel[];
  public adminLevelLabel: AdminLevelLabel = new AdminLevelLabel();
  private country: Country;
  private disasterType: DisasterType;
  public activeLayerNames: IbfLayerName[] = [];

  private static loadAdminLevelLabels(country: Country): AdminLevelLabel {
    const adminLevelLabels = {
      adminLevel1: '',
      adminLevel2: '',
      adminLevel3: '',
      adminLevel4: '',
    };

    if (country.adminRegionLabels[1]) {
      adminLevelLabels.adminLevel1 = country.adminRegionLabels[1].plural;
    }
    if (country.adminRegionLabels[2]) {
      adminLevelLabels.adminLevel2 = country.adminRegionLabels[2].plural;
    }
    if (country.adminRegionLabels[3]) {
      adminLevelLabels.adminLevel3 = country.adminRegionLabels[3].plural;
    }
    if (country.adminRegionLabels[4]) {
      adminLevelLabels.adminLevel4 = country.adminRegionLabels[4].plural;
    }

    return adminLevelLabels;
  }

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;

    if (this.country && this.disasterType) {
      this.processAdminLevel();
    }
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;

    if (this.country && this.disasterType) {
      this.processAdminLevel();
    }
  };

  private processAdminLevel() {
    this.countryAdminLevels = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).adminLevels;
    this.setAdminLevel(
      this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).defaultAdminLevel,
    );
    this.adminLevelLabel = AdminLevelService.loadAdminLevelLabels(this.country);
  }

  getAdminLevelSubscription = (): Observable<AdminLevel> => {
    return this.adminLevelSubject.asObservable();
  };

  public setAdminLevel(adminLevel: AdminLevel) {
    this.adminLevel = adminLevel;
    if (this.adminLevel !== this.oldAdminLevel) {
      this.adminLevelSubject.next(this.adminLevel);
    }
    this.oldAdminLevel = this.adminLevel;
  }
}
