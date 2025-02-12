import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { AREAS_OF_FOCUS } from 'src/app/models/area-of-focus.const';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AlertAreaService } from 'src/app/services/alert-area.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AlertArea } from 'src/app/types/alert-area';
import { AreaOfFocus } from 'src/app/types/area-of-focus';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';

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
  public areasOfFocus: AreaOfFocus[] = AREAS_OF_FOCUS;
  public alertAreas: AlertArea[];
  public eventState: EventState;
  public placeCode: PlaceCode;

  constructor(
    private alertAreaService: AlertAreaService,
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

    this.eapActionSubscription = this.alertAreaService
      .getAlertAreas()
      .subscribe(this.onAlertAreasChange);

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

  private onAlertAreasChange = (alertAreas: AlertArea[]) => {
    this.alertAreas = alertAreas;
    this.calculateEAPActionStatus(this.alertAreas);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.calculateEAPActionStatus(this.alertAreas);
  };

  private onEachEAPAction =
    (areaOfFocus: AreaOfFocus) => (action: EapAction) => {
      // And count the total # of (checked) tasks this way
      if (areaOfFocus.id === action.aof) {
        areaOfFocus.count += 1;
        if (action.checked) {
          areaOfFocus.countChecked += 1;
        }
      }
    };

  private onEachAlertArea = (areaOfFocus: AreaOfFocus) => (area: AlertArea) => {
    // And at each action within the area ..
    area.eapActions.forEach(this.onEachEAPAction(areaOfFocus));
  };

  private calculateEAPActionStatus(alertAreas: AlertArea[]): void {
    if (this.placeCode) {
      alertAreas = alertAreas.filter(
        (a) => a.placeCode === this.placeCode?.placeCode,
      );
    }
    const onEachAreaOfFocus = (areaOfFocus: AreaOfFocus) => {
      areaOfFocus.count = 0;
      areaOfFocus.countChecked = 0;
      // Look at each alert area ..
      alertAreas.forEach(this.onEachAlertArea(areaOfFocus));
    };

    // Start calculation only when last area has eapActions attached to it
    if (alertAreas[alertAreas.length - 1]?.eapActions) {
      // For each area of focus ..
      this.areasOfFocus.forEach(onEachAreaOfFocus);
    }
    this.changeDetectorRef.detectChanges();
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
        this.eventService.state.forecastTrigger ? 'trigger-alert' : 'no-alert'
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

    void popover.present();
  }

  public showAreasOfFocusSummary(): boolean {
    if (!this.countryDisasterSettings.enableEarlyActions) {
      return false;
    }
    return true;
  }
}
