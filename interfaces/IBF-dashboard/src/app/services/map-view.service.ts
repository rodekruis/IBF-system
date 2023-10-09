import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CountryDisasterSettings } from '../models/country.model';
import { PlaceCode } from '../models/place-code.model';
import { EventState } from '../types/event-state';
import { MapView } from '../types/map-view';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { PlaceCodeService } from './place-code.service';

@Injectable({
  providedIn: 'root',
})
export class MapViewService {
  private breadcrumbsMapViewSubject = new BehaviorSubject<MapView>(null);
  private breadcrumbsMapView: MapView;

  private aggregatesMapViewSubject = new BehaviorSubject<MapView>(null);
  private aggregatesMapView: MapView;

  private eventState: EventState;
  private placeCode: PlaceCode;
  private placeCodeHover: PlaceCode;

  private countryDisasterSettings: CountryDisasterSettings;

  constructor(
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);
    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);
    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlacecodeChange);
    this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlacecodeHoverChange);
    this.disasterTypeService
      .getCountryDisasterSettingsSubscription()
      .subscribe(this.onCountryDisasterSettingsChange);
  }

  private setAggregatesMapView(view: MapView) {
    this.aggregatesMapView = view;
    this.aggregatesMapViewSubject.next(this.aggregatesMapView);
  }

  private setBreadcrumbsMapView(view: MapView) {
    this.breadcrumbsMapView = view;
    this.breadcrumbsMapViewSubject.next(this.breadcrumbsMapView);
    this.setAggregatesMapView(view);
  }

  private updateAggregatesMapView() {
    if (
      this.aggregatesMapView === MapView.national &&
      this.placeCodeHover?.eventName
    ) {
      this.setAggregatesMapView(MapView.event);
      return;
    }

    if (!this.eventState?.event && this.placeCodeHover) {
      this.setAggregatesMapView(MapView.adminArea);
      return;
    }

    if (!this.eventState || !this.eventState.event) {
      this.setAggregatesMapView(MapView.national);
      return;
    }

    if (this.eventState.event && !this.placeCodeHover) {
      this.countryDisasterSettings?.isEventBased
        ? this.setAggregatesMapView(MapView.event)
        : this.setAggregatesMapView(MapView.national);
      return;
    }

    if (this.placeCodeHover) {
      this.setAggregatesMapView(MapView.adminArea);
      return;
    }

    this.setAggregatesMapView(MapView.national);
  }

  private updateBreadcrumbsMapView() {
    if (!this.eventState?.event && this.placeCode) {
      this.setAggregatesMapView(MapView.adminArea);
      return;
    }

    if (!this.eventState || !this.eventState.event) {
      this.setBreadcrumbsMapView(MapView.national);
      return;
    }

    if (this.eventState.event && !this.placeCode) {
      this.countryDisasterSettings?.isEventBased
        ? this.setBreadcrumbsMapView(MapView.event)
        : this.setBreadcrumbsMapView(MapView.national);
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
  private onPlacecodeHoverChange = (placeCode: PlaceCode) => {
    this.placeCodeHover = placeCode;
    this.updateAggregatesMapView();
  };

  private onCountryDisasterSettingsChange = (
    settings: CountryDisasterSettings,
  ) => {
    this.countryDisasterSettings = settings;
    this.updateAggregatesMapView();
  };
}
