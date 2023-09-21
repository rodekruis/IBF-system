import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaceCode } from '../models/place-code.model';
import { EventState } from '../types/event-state';
import { MapView } from '../types/map-view';
import { EventService } from './event.service';
import { PlaceCodeService } from './place-code.service';

@Injectable({
  providedIn: 'root',
})
export class MapViewService {
  private mapViewSubject = new BehaviorSubject<MapView>(null);
  private mapView: MapView;

  private eventState: EventState;
  private placeCode: PlaceCode;
  private placeCodeHover: PlaceCode;

  constructor(
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
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
  }

  private setMapView(view: MapView) {
    this.mapView = view;
    this.mapViewSubject.next(this.mapView);
  }

  private updateMapView() {
    if (!this.eventState?.event && this.placeCodeHover) {
      this.setMapView(MapView.adminArea);
      return;
    }

    if (!this.eventState || !this.eventState.event) {
      this.setMapView(MapView.national);
      return;
    }

    if (this.eventState.event && !this.placeCode && !this.placeCodeHover) {
      this.eventHasName()
        ? this.setMapView(MapView.event)
        : this.setMapView(MapView.national);
      return;
    }

    if (this.placeCode || this.placeCodeHover) {
      this.setMapView(MapView.adminArea);
      return;
    }

    this.setMapView(MapView.national);
  }

  public getMapViewSubscription(): Observable<MapView> {
    return this.mapViewSubject.asObservable();
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.updateMapView();
  };

  private onPlacecodeChange = (pc: PlaceCode) => {
    this.placeCode = pc;
    this.updateMapView();
  };
  private onPlacecodeHoverChange = (pc: PlaceCode) => {
    this.placeCodeHover = pc;
    this.updateMapView();
  };

  private eventHasName(): boolean {
    if (
      !this.eventState ||
      !this.eventState.event ||
      !this.eventState.event.eventName
    ) {
      return false;
    }

    return true;
  }
}
