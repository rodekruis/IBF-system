import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AreaOfFocus } from 'src/app/types/area-of-focus';
import { EventState } from 'src/app/types/event-state';
import { TriggeredArea } from 'src/app/types/triggered-area';

@Component({
  selector: 'app-areas-of-focus-summary',
  templateUrl: './areas-of-focus-summary.component.html',
  styleUrls: ['./areas-of-focus-summary.component.scss'],
  standalone: false,
})
export class AreasOfFocusSummaryComponent implements OnInit, OnDestroy {
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private countrySubscription: Subscription;
  public disasterTypeSubscription: Subscription;

  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;
  public areasOfFocus: AreaOfFocus[];
  public triggeredAreas: TriggeredArea[];
  public trigger: boolean;
  public eventState: EventState;
  public placeCode: PlaceCode;

  constructor(
    private eapActionsService: EapActionsService,
    private apiService: ApiService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private changeDetectorRef: ChangeDetectorRef,
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    private disasterTypeService: DisasterTypeService,
    private countryService: CountryService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

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
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
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

  private onTriggeredAreasChange = (triggeredAreas: TriggeredArea[]) => {
    this.triggeredAreas = triggeredAreas;
    this.calculateEAPActionStatus(this.triggeredAreas);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.calculateEAPActionStatus(this.triggeredAreas);
  };

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
    if (this.placeCode) {
      triggeredAreas = triggeredAreas.filter(
        (a) => a.placeCode === this.placeCode?.placeCode,
      );
    }
    const onEachAreaOfFocus = (areaOfFocus: AreaOfFocus) => {
      areaOfFocus.count = 0;
      areaOfFocus.countChecked = 0;
      // Look at each triggered area ..
      triggeredAreas.forEach(this.onEachTriggeredArea(areaOfFocus));
    };

    const onAreasOfFocusChange = (areasOfFocus: AreaOfFocus[]) => {
      this.areasOfFocus = areasOfFocus;

      // Start calculation only when last area has eapActions attached to it
      if (triggeredAreas[triggeredAreas.length - 1]?.eapActions) {
        // For each area of focus ..
        this.areasOfFocus.forEach(onEachAreaOfFocus);
      }
      this.changeDetectorRef.detectChanges();
    };

    // Get areas of focus from db
    if (triggeredAreas.length) {
      this.apiService.getAreasOfFocus().subscribe(onAreasOfFocusChange);
    }
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  public async moreInfo(areaOfFocus: AreaOfFocus): Promise<void> {
    const { id, label, description } = areaOfFocus;

    const popover = await this.popoverController.create({
      component: LayerControlInfoPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
        this.eventService.state.thresholdReached ? 'trigger-alert' : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        layer: {
          label,
          description,
        },
      },
    });

    this.analyticsService.logEvent(AnalyticsEvent.aggregateInformation, {
      indicator: id,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    popover.present();
  }

  public showAreasOfFocusSummary(): boolean {
    if (!this.countryDisasterSettings.enableEarlyActions) {
      return false;
    }
    return true;
  }
}
