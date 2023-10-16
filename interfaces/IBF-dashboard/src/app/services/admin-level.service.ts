import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AdminLevel,
  AdminLevelLabel,
  AdminLevelType,
} from 'src/app/types/admin-level';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from '../models/country.model';
import { PlaceCode } from '../models/place-code.model';
import { EventState } from '../types/event-state';
import { IbfLayerName } from '../types/ibf-layer';
import { TimelineState } from '../types/timeline-state';
import { CountryService } from './country.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { TimelineService } from './timeline.service';

export class AdminLevelButton {
  adminLevel: AdminLevel;
  disabled: boolean;
  label: string;
  buttonTypeClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminLevelService {
  private adminLevelSubject = new BehaviorSubject<AdminLevel>(
    AdminLevel.adminLevel1,
  );
  public oldAdminLevel: AdminLevel = null;
  public adminLevel: AdminLevel;
  private allCountryAdminLevels: AdminLevel[];
  private adminLevelButtonsSubject = new BehaviorSubject<AdminLevelButton[]>(
    [],
  );
  private adminLevelButtons: AdminLevelButton[];
  public adminLevelLabel: AdminLevelLabel = new AdminLevelLabel();
  public activeLayerNames: IbfLayerName[] = [];

  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;
  private eventState: EventState;
  private timelineState: TimelineState;

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
    private eventService: EventService,
    private timelineService: TimelineService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onInitialEventStateChange);

    this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.countryDisasterSettings = this.disasterTypeService.getCountryDisasterTypeSettings(
      this.country,
      this.disasterType,
    );
    this.activeLayerNames = [];
  };

  private onInitialEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.activeLayerNames = [];
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    if (
      this.country &&
      this.disasterType &&
      this.eventState &&
      this.timelineState
    ) {
      this.processAdminLevel();
    }
  };

  private processAdminLevel() {
    this.allCountryAdminLevels = Object.keys(
      this.country.adminRegionLabels,
    ).map((k) => Number(k));

    this.setAdminLevel(this.countryDisasterSettings.defaultAdminLevel);

    this.adminLevelLabel = AdminLevelService.loadAdminLevelLabels(this.country);

    this.adminLevelButtons = this.allCountryAdminLevels.map((level) => {
      return {
        adminLevel: level,
        disabled: !this.countryDisasterSettings.adminLevels.includes(level),
        label: this.country.adminRegionLabels[level].plural,
        buttonTypeClass: this.getButtonTypeClass(level),
      };
    });

    this.adminLevelButtonsSubject.next(this.adminLevelButtons);
  }

  public getAdminLevelButtonsSubscription(): Observable<AdminLevelButton[]> {
    return this.adminLevelButtonsSubject.asObservable();
  }

  getAdminLevelSubscription = (): Observable<AdminLevel> => {
    return this.adminLevelSubject.asObservable();
  };

  public setAdminLevel(adminLevel: AdminLevel) {
    this.adminLevel = adminLevel;
    this.adminLevelSubject.next(this.adminLevel);
  }

  public zoomInAdminLevel() {
    const adminLevels = this.countryDisasterSettings.adminLevels;
    if (this.adminLevel < adminLevels[adminLevels.length - 1]) {
      this.adminLevel = this.adminLevel + 1;
      this.adminLevelSubject.next(this.adminLevel);
    }
  }

  public zoomOutAdminLevel() {
    if (this.adminLevel > this.countryDisasterSettings.defaultAdminLevel) {
      this.adminLevel = this.adminLevel - 1;
      this.adminLevelSubject.next(this.adminLevel);
    }
  }

  public zoomToDefaultAdminLevel() {
    this.adminLevel = this.countryDisasterSettings.defaultAdminLevel;
    this.adminLevelSubject.next(this.adminLevel);
  }

  private getButtonTypeClass(adminLevel: AdminLevel): string {
    const prefix = 'breadcrumb-';
    const length = this.allCountryAdminLevels?.length;
    if (length === 1) {
      return `${prefix}alone`;
    }
    if (adminLevel === AdminLevel.adminLevel1) {
      return `${prefix}start`;
    }
    if (adminLevel === length) {
      return `${prefix}end`;
    }

    return `${prefix}middle`;
  }

  public getAdminLevelType(placeCode: PlaceCode): AdminLevelType {
    if (this.countryDisasterSettings.adminLevels?.length === 1) {
      return AdminLevelType.single;
    } else if (this.isDeepestAdminLevel(placeCode)) {
      return AdminLevelType.deepest;
    } else {
      return AdminLevelType.higher;
    }
  }

  private isDeepestAdminLevel(placeCode: PlaceCode): boolean {
    return (
      this.countryDisasterSettings.adminLevels[
        this.countryDisasterSettings.adminLevels.length - 1
      ] === this.adminLevel && placeCode?.adminLevel === this.adminLevel
    );
  }
}
