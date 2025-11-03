import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CheckboxCustomEvent, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { AlertAreaService } from 'src/app/services/alert-area.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import {
  ALERT_LEVEL_COLOUR,
  ALERT_LEVEL_TEXT_COLOUR,
  Event,
  EventService,
} from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel, AdminLevelType } from 'src/app/types/admin-level';
import { AlertArea } from 'src/app/types/alert-area';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { TimelineState } from 'src/app/types/timeline-state';
import { environment } from 'src/environments/environment';

export interface CardColors {
  iconColor: string;
  headerTextColor: string;
  borderColor: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: false,
})
export class ChatComponent implements OnInit, OnDestroy {
  public alertAreas: AlertArea[];
  public filteredAreas: AlertArea[];
  public activeDisasterType: string;
  public eventState: EventState;
  private timelineState: TimelineState;
  private indicators: Indicator[];
  public placeCode: PlaceCode;

  private updateSuccessMessage: string;
  private updateFailureMessage: string;

  private countrySubscription: Subscription;
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;
  private indicatorSubscription: Subscription;

  public eapActions: EapAction[];
  public adminAreaLabel: string;
  public adminAreaLabelPlural: string;
  public disasterTypeLabel: string;
  public disasterTypeName: string;
  public mainExposureIndicatorLabel: string;
  public mainExposureIndicatorNumberFormat: NumberFormat;
  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;
  public lastUploadDate: string;
  private lastUploadDateFormat = 'cccc, dd LLLL HH:mm';
  public isLastUploadDateLate = false;
  public supportEmailAddress = environment.supportEmailAddress;
  public adminLevel: AdminLevel;

  constructor(
    private alertAreaService: AlertAreaService,
    private authService: AuthService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
    private timelineService: TimelineService,
    private countryService: CountryService,
    private aggregatesService: AggregatesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private adminLevelService: AdminLevelService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.eapActionSubscription = this.alertAreaService
      .getAlertAreas()
      .subscribe(this.onAlertAreasChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe(this.onIndicatorChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
    this.timelineStateSubscription.unsubscribe();
    this.indicatorSubscription.unsubscribe();
  }

  get userName() {
    return this.authService.userName;
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

  private onIndicatorChange = (indicators: Indicator[]) => {
    this.indicators = indicators;
    this.setupChatText();
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    // SIMULATE: change this to simulate different months (only in chat-component)
    // const addMonthsToCurrentDate = -1;
    // this.timelineState.today = this.timelineState.today.plus({
    //   months: addMonthsToCurrentDate,
    // });
    this.setupChatText();
  };

  private onAlertAreasChange = (alertAreas: AlertArea[]) => {
    this.alertAreas = alertAreas;
    this.onPlaceCodeChange(this.placeCode);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;

    const activeLeadTime = this.timelineState?.timeStepButtons.find(
      (t) => t.value === this.timelineState?.activeLeadTime,
    );

    if (placeCode && (!activeLeadTime || activeLeadTime.forecastAlert)) {
      const filterAreasByPlaceCode = (alertArea: AlertArea) =>
        alertArea.placeCode === placeCode.placeCode;

      this.filteredAreas = this.alertAreas.filter(filterAreasByPlaceCode);
    } else {
      this.setDefaultFilteredAreas();
    }
    this.changeDetectorRef.detectChanges();
  };

  private setDefaultFilteredAreas = () => {
    this.filteredAreas = [];
  };

  private setupChatText = () => {
    if (
      this.country &&
      this.disasterType &&
      this.indicators.length &&
      this.timelineState
    ) {
      this.adminLevel =
        this.placeCode?.adminLevel ||
        this.countryDisasterSettings.defaultAdminLevel;

      this.adminAreaLabel =
        this.country.adminRegionLabels[this.adminLevel].singular;

      this.adminAreaLabelPlural =
        this.country.adminRegionLabels[this.adminLevel].plural.toLowerCase();

      this.changeDetectorRef.detectChanges();
      this.disasterTypeLabel = this.disasterType.label;
      this.disasterTypeName = this.disasterType.disasterType;

      const mainExposureIndicator = this.indicators.find((indicator) => {
        return indicator.name === this.disasterType.mainExposureIndicator;
      });

      this.mainExposureIndicatorLabel =
        mainExposureIndicator?.label.toLowerCase();

      this.mainExposureIndicatorNumberFormat =
        mainExposureIndicator?.numberFormatMap;

      this.updateSuccessMessage = this.translateService.instant(
        'chat-component.common.save-actions.update-success',
      ) as string;

      this.updateFailureMessage = this.translateService.instant(
        'chat-component.common.save-actions.update-failure',
      ) as string;

      this.setLastModelRunDate(this.disasterType);
      this.changeDetectorRef.detectChanges();
    }
  };

  private setLastModelRunDate = (disasterType: DisasterType) => {
    const lastUploadDate = this.timelineState.today;

    this.lastUploadDate = lastUploadDate
      ? lastUploadDate.toFormat(this.lastUploadDateFormat)
      : 'unknown';

    this.isLastUploadDateLate = this.eventService.isLastUploadDateLate(
      lastUploadDate.toJSDate(), // TODO: migrate from luxon (DateTime) to date-fns (Date) over time completely
      disasterType,
    );
  };

  private filterAreaByPlaceCode =
    (placeCode: string) => (alertArea: AlertArea) =>
      alertArea.placeCode === placeCode;

  private filterEAPActionByEAPAction =
    (action: string) => (eapAction: EapAction) =>
      eapAction.action === action;

  public changeAction(
    event: CheckboxCustomEvent,
    placeCode: string,
    action: string,
    checkbox: boolean,
  ) {
    this.analyticsService.logEvent(AnalyticsEvent.eapAction, {
      placeCode,
      eapAction: action,
      eapActionStatus: checkbox,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    const filterAreaByPlaceCode = this.filterAreaByPlaceCode(placeCode);
    const alertArea = this.alertAreas.find(filterAreaByPlaceCode);
    const changedAction = alertArea.eapActions.find(
      this.filterEAPActionByEAPAction(action),
    );

    changedAction.checked = checkbox;

    this.checkEAPAction(changedAction).subscribe({
      next: () => {
        void this.showToast(this.updateSuccessMessage);
      },
      error: () => {
        changedAction.checked = !checkbox;
        event.target.checked = !checkbox;
        void this.showToast(this.updateFailureMessage);
      },
    });
  }

  private showToast = async (message: string) => {
    const toast = await this.toastController.create({
      message,
      duration: TOAST_DURATION,
      position: TOAST_POSITION,
    });

    void toast.present();
  };

  private checkEAPAction = (action: EapAction) => {
    return this.alertAreaService.checkEapAction(
      action.action,
      action.checked,
      action.placeCode,
      this.eventState?.event?.eventName,
    );
  };

  public getRegion = (placeCode: string): string => {
    if (!this.countryDisasterSettings.droughtRegions) {
      return 'National';
    } else {
      for (const droughtRegion of Object.keys(
        this.countryDisasterSettings.droughtRegions,
      )) {
        if (
          this.countryDisasterSettings.droughtRegions[droughtRegion].includes(
            placeCode,
          )
        ) {
          return droughtRegion;
        }
      }
    }
  };

  public revertAreaSelection() {
    // TODO: merge/share this code with zoom-out actions in admin-level.component
    // do not zoom out when on deepest level, because the deepest 2 levels have the same adminLevel in the map, and just differ on adminLevel/placeCode of the chat-section
    if (
      this.adminLevelService.getAdminLevelType(this.placeCode) !==
      AdminLevelType.deepest
    ) {
      this.adminLevelService.zoomOutAdminLevel();
    }

    // if not on highest level, then set placeCode to parent
    if (this.placeCode.placeCodeParent) {
      this.placeCodeService.setPlaceCode(this.placeCode.placeCodeParent);
    } else {
      this.placeCodeService.clearPlaceCode();
    }
  }

  public getAreaParentString(area: AlertArea): string {
    if (!area.nameParent) {
      return '';
    }

    return ` (${area.nameParent})`;
  }

  public getCardColors(event: Event): CardColors {
    return {
      iconColor: ALERT_LEVEL_COLOUR[event.alertLevel],
      headerTextColor: ALERT_LEVEL_TEXT_COLOUR[event.alertLevel],
      borderColor: ALERT_LEVEL_COLOUR[event.alertLevel],
    };
  }
}
