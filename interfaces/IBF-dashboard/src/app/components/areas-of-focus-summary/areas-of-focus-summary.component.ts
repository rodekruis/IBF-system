import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { EventState } from 'src/app/types/event-state';

@Component({
  selector: 'app-areas-of-focus-summary',
  templateUrl: './areas-of-focus-summary.component.html',
  styleUrls: ['./areas-of-focus-summary.component.scss'],
})
export class AreasOfFocusSummaryComponent implements OnInit, OnDestroy {
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private areasOfFocusSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;

  public areasOfFocus: any[];
  public triggeredAreas: any[];
  public trigger: boolean;
  public eventState: EventState;

  constructor(
    private eapActionsService: EapActionsService,
    private apiService: ApiService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);
  }

  ngOnDestroy() {
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.areasOfFocusSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
  }

  private onTriggeredAreasChange = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.calculateEAPActionStatus(this.triggeredAreas);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    if (placeCode) {
      const filterTriggeredAreasByPlaceCode = (triggeredArea) =>
        triggeredArea.placeCode === placeCode.placeCode;

      const filteredAreas = this.triggeredAreas.filter(
        filterTriggeredAreasByPlaceCode,
      );
      this.calculateEAPActionStatus(filteredAreas);
    } else {
      this.calculateEAPActionStatus(this.triggeredAreas);
    }
  };

  // data needs to be reorganized to avoid the mess that follows

  private onEachEAPAction = (areaOfFocus) => (action) => {
    // And count the total # of (checked) tasks this way
    if (areaOfFocus.id === action.aof) {
      areaOfFocus.count += 1;
      if (action.checked) {
        areaOfFocus.countChecked += 1;
      }
    }
  };

  private onEachTriggeredArea = (areaOfFocus) => (area) => {
    // And at each action within the area ..
    area.eapActions.forEach(this.onEachEAPAction(areaOfFocus));
  };

  private calculateEAPActionStatus(triggeredAreas): void {
    const onEachAreaOfFocus = (areaOfFocus) => {
      areaOfFocus.count = 0;
      areaOfFocus.countChecked = 0;
      // Look at each triggered area ..
      triggeredAreas.forEach(this.onEachTriggeredArea(areaOfFocus));
    };

    const onAreasOfFocusChange = (areasOfFocus) => {
      this.areasOfFocus = areasOfFocus;

      // Start calculation only when last area has eapActions attached to it
      if (triggeredAreas[triggeredAreas.length - 1]?.eapActions) {
        // For each area of focus ..
        this.areasOfFocus.forEach(onEachAreaOfFocus);
      }
      this.changeDetectorRef.detectChanges();
    };

    // Get areas of focus from db
    this.areasOfFocusSubscription = this.apiService
      .getAreasOfFocus()
      .subscribe(onAreasOfFocusChange);
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };
}
