import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import {
  AdminLevelButton,
  AdminLevelService,
} from 'src/app/services/admin-level.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel, AdminLevelType } from 'src/app/types/admin-level';
import { IbfLayer, IbfLayerGroup, IbfLayerName } from 'src/app/types/ibf-layer';
import { DisasterType } from '../../models/country.model';
import { PlaceCode } from '../../models/place-code.model';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { MapViewService } from '../../services/map-view.service';
import { PlaceCodeService } from '../../services/place-code.service';
import { DisasterTypeKey } from '../../types/disaster-type-key';
import { EventState } from '../../types/event-state';
import { MapView } from '../../types/map-view';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent implements OnInit, OnDestroy {
  public disasterType: Observable<DisasterType>;

  public mapViewEnum = MapView;
  public currentMapView: MapView;
  private mapViewSubscription: Subscription;

  public adminLevelButtons: Observable<AdminLevelButton[]>;

  public adminLevel = AdminLevel;

  private eventStateSubscription: Subscription;
  public eventState: EventState;

  private placeCodeSubscription: Subscription;
  public placeCode: PlaceCode;

  private breadcrumbDisasters = [
    DisasterTypeKey.flashFloods,
    DisasterTypeKey.heavyRain,
    DisasterTypeKey.dengue,
    DisasterTypeKey.malaria,
    DisasterTypeKey.floods,
  ];

  constructor(
    public adminLevelService: AdminLevelService,
    private mapService: MapService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
    private mapViewService: MapViewService,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.disasterType = this.disasterTypeService.getDisasterTypeSubscription();
    this.mapViewSubscription = this.mapViewService
      .getBreadcrumbsMapViewSubscription()
      .subscribe(this.onMapViewChange);
    this.eventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventChange);
    this.adminLevelButtons = this.adminLevelService.getAdminLevelButtonsSubscription();
    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }
  ngOnDestroy(): void {
    this.mapViewSubscription.unsubscribe();
    this.eventStateSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
  }

  private onMapViewChange = (view: MapView) => {
    this.currentMapView = view;
    this.changeDetectorRef.detectChanges();
  };

  private onEventChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.changeDetectorRef.detectChanges();
  };

  public clickAdminLevelButton(adminLevel: AdminLevel): void {
    const layer = this.getAdminLevelLayer(adminLevel);

    if (adminLevel !== this.adminLevelService.adminLevel) {
      this.adminLevelService.activeLayerNames = this.mapService.layers
        .filter((l) => l.active && l.group !== IbfLayerGroup.adminRegions)
        .map((l) => l.name);
      this.placeCodeService.clearPlaceCode();
      this.adminLevelService.setAdminLevel(adminLevel);

      this.analyticsService.logEvent(AnalyticsEvent.adminLevel, {
        adminLevel,
        adminLevelState: layer.active,
        page: AnalyticsPage.dashboard,
        isActiveTrigger: this.eventService.state.activeTrigger,
        component: this.constructor.name,
      });
    } else {
      this.mapService.toggleLayer(layer);
    }
  }

  public isAdminLevelActive = (
    adminLevel: AdminLevel,
    disabled: boolean,
  ): boolean => {
    const layer = this.getAdminLevelLayer(adminLevel);
    if (!layer) {
      return false;
    }

    return layer.active && !disabled;
  };

  public getAdminLevelLabel(adminLevel: AdminLevel): string {
    return this.adminLevelService.adminLevelLabel
      ? this.adminLevelService.adminLevelLabel[AdminLevel[adminLevel]]
      : `Admin Level ${adminLevel}`;
  }

  private getAdminLevelLayerName(adminLevel: AdminLevel): IbfLayerName {
    return `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerName;
  }

  public getAdminLevelLayer(adminLevel: AdminLevel): IbfLayer {
    const layerName = this.getAdminLevelLayerName(adminLevel);
    return this.mapService.getLayerByName(layerName);
  }

  public useBreadcrumbs(disasterType: DisasterType): boolean {
    return this.breadcrumbDisasters.includes(
      disasterType?.disasterType as DisasterTypeKey,
    );
  }

  public clickBreadcrumbButton(breadCrumb: MapView, selected: boolean) {
    if (selected) {
      return;
    }

    // This currently only applies for UGA floods level 4 to 3
    if (breadCrumb === MapView.adminArea2) {
      if (
        this.adminLevelService.getAdminLevelType(this.placeCode) !==
        AdminLevelType.deepest
      ) {
        this.adminLevelService.zoomOutAdminLevel();
      }
      this.placeCodeService.setPlaceCode(this.placeCode.placeCodeParent);
    }

    // This has to work for the following scenarios
    // scenario 1: UGA floods level 4 to 2
    // scenario 2: UGA floods level 3 to 2 (where 3 is not deepest)
    // scenario 3: ZMB floods level 3 to 2 (where 3 is deepest)
    if (breadCrumb === MapView.adminArea) {
      if (this.currentMapView === MapView.adminArea3) {
        this.adminLevelService.zoomOutAdminLevel();
        this.placeCodeService.setPlaceCode(
          this.placeCode.placeCodeParent.placeCodeParent,
        );
      } else if (this.currentMapView === this.mapViewEnum.adminArea2) {
        if (
          this.adminLevelService.getAdminLevelType(this.placeCode) !==
          AdminLevelType.deepest
        ) {
          this.adminLevelService.zoomOutAdminLevel();
        }
        this.placeCodeService.setPlaceCode(this.placeCode.placeCodeParent);
      }
    }

    if (breadCrumb === MapView.event) {
      this.placeCodeService?.clearPlaceCode();
      return;
    }

    if (breadCrumb === MapView.national) {
      if (this.mapViewService.eventHasName()) {
        this.eventService?.resetEvents();
        return;
      } else {
        this.adminLevelService.zoomToDefaultAdminLevel();
        this.placeCodeService?.clearPlaceCode();
        return;
      }
    }
  }

  public showBreadcrumb(breadCrumb: MapView): boolean {
    if (breadCrumb === MapView.national) {
      return [
        MapView.national,
        MapView.event,
        MapView.adminArea,
        MapView.adminArea2,
        MapView.adminArea3,
      ].includes(this.currentMapView);
    } else if (breadCrumb === MapView.event) {
      return (
        [
          MapView.event,
          MapView.adminArea,
          MapView.adminArea2,
          MapView.adminArea3,
        ].includes(this.currentMapView) && this.mapViewService.eventHasName() // TODO: use isEventBased boolean & move to service & check all other uses of eventHasName
      );
    } else if (breadCrumb === MapView.adminArea) {
      return [
        MapView.adminArea,
        MapView.adminArea2,
        MapView.adminArea3,
      ].includes(this.currentMapView);
    } else if (breadCrumb === MapView.adminArea2) {
      return [MapView.adminArea2, MapView.adminArea3].includes(
        this.currentMapView,
      );
    } else if (breadCrumb === MapView.adminArea3) {
      return [MapView.adminArea3].includes(this.currentMapView);
    }
  }
}
