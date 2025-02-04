import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { EventState } from 'src/app/types/event-state';
import { MapView } from 'src/app/types/map-view';

@Injectable({
  providedIn: 'root',
})
export class MapViewService {
  private breadcrumbsMapViewSubject = new BehaviorSubject<MapView>(null);
  private breadcrumbsMapView: MapView;

  private aggregatesMapViewSubject = new BehaviorSubject<MapView>(null);
  private aggregatesMapView: MapView;

  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;
  private eventState: EventState;
  private placeCode: PlaceCode;

  constructor(
    private countryService: CountryService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);
    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);
    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlacecodeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
  };

  private setAggregatesMapView(view: MapView) {
    this.aggregatesMapView = view;
    this.aggregatesMapViewSubject.next(this.aggregatesMapView);
  }

  private setBreadcrumbsMapView(view: MapView) {
    this.breadcrumbsMapView = view;
    this.breadcrumbsMapViewSubject.next(this.breadcrumbsMapView);
    this.setAggregatesMapView(view);
  }

  private updateBreadcrumbsMapView() {
    // TODO: is this option still possible after removing isEventBased?
    if (!this.eventState?.event && this.placeCode) {
      this.setAggregatesMapView(MapView.adminArea);
      return;
    }

    if (!this.eventState?.event) {
      this.setBreadcrumbsMapView(MapView.national);
      return;
    }

    if (this.eventState.event && !this.placeCode) {
      console.log(
        'this.eventState.event && !this.placeCode: ',
        this.eventState.event && !this.placeCode,
      );
      this.setBreadcrumbsMapView(MapView.event);
      return;
    }

    if (this.placeCode?.placeCodeParent?.placeCodeParent) {
      this.setBreadcrumbsMapView(MapView.adminArea3);
      return;
    }

    if (this.placeCode?.placeCodeParent) {
      this.setBreadcrumbsMapView(MapView.adminArea2);
      return;
    }

    if (this.placeCode) {
      this.setBreadcrumbsMapView(MapView.adminArea);
      return;
    }

    this.setBreadcrumbsMapView(MapView.national);
  }

  public getBreadcrumbsMapViewSubscription(): Observable<MapView> {
    return this.breadcrumbsMapViewSubject.asObservable();
  }

  public getAggregatesMapViewSubscription(): Observable<MapView> {
    return this.aggregatesMapViewSubject.asObservable();
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.updateBreadcrumbsMapView();
  };

  private onPlacecodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.updateBreadcrumbsMapView();
  };
}
