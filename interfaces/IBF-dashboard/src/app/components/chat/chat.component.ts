import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ActionResultPopoverComponent } from 'src/app/components/action-result-popover/action-result-popover.component';
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
import { EventService, EventSummary } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel, AdminLevelType } from 'src/app/types/admin-level';
import { AlertArea } from 'src/app/types/alert-area';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';
import { environment } from 'src/environments/environment';

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
  public disasterTypeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;
  private indicatorSubscription: Subscription;

  public eapActions: EapAction[];
  public changedActions: EapAction[] = [];
  public submitDisabled = true;
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
  public isWarn = false;
  public supportEmailAddress = environment.supportEmailAddress;
  public adminLevel: AdminLevel;

  constructor(
    private alertAreaService: AlertAreaService,
    public authService: AuthService,
    public eventService: EventService,
    public placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
    private timelineService: TimelineService,
    private countryService: CountryService,
    private aggregatesService: AggregatesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private popoverController: PopoverController,
    private adminLevelService: AdminLevelService,
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
    this.alertAreas.forEach((area) => {
      this.disableSubmitButtonForArea(area);
    });
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
        `chat-component.common.save-actions.update-success`,
      ) as string;
      this.updateFailureMessage = this.translateService.instant(
        `chat-component.common.save-actions.update-failure`,
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
    this.isWarn = this.eventService.isLastUploadDateStale(
      lastUploadDate.toJSDate(), // TODO: migrate from luxon (DateTime) to date-fns (Date) over time completely
      disasterType,
    );
  };

  private disableSubmitButtonForArea = (alertArea: AlertArea) =>
    (alertArea.submitDisabled = true);

  private filterAreaByPlaceCode =
    (placeCode: string) => (alertArea: AlertArea) =>
      alertArea.placeCode === placeCode;

  private filterChangedEAPActionByChangedEAPAction =
    (changedAction: EapAction) => (eapAction: EapAction) =>
      !(eapAction.action === changedAction.action);

  private filterEAPActionByEAPAction =
    (action: string) => (eapAction: EapAction) =>
      eapAction.action === action;

  private filterEAPActionByPlaceCode =
    (placeCode: string) => (eapAction: EapAction) =>
      eapAction.placeCode === placeCode;

  public changeAction(
    placeCode: string,
    action: string,
    checkbox: boolean,
  ): void {
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
    if (!this.changedActions.includes(changedAction)) {
      this.changedActions.push(changedAction);
    } else {
      this.changedActions = this.changedActions.filter(
        this.filterChangedEAPActionByChangedEAPAction(changedAction),
      );
    }
    this.alertAreas.find(filterAreaByPlaceCode).submitDisabled =
      this.changedActions.length === 0;
    this.changeDetectorRef.detectChanges();
  }

  private checkEAPAction = (action: EapAction) => {
    return this.alertAreaService.checkEapAction(
      action.action,
      action.checked,
      action.placeCode,
      this.eventState?.event?.eventName,
    );
  };

  public submitEapAction(placeCode: string): void {
    this.analyticsService.logEvent(AnalyticsEvent.eapSubmit, {
      placeCode,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    this.alertAreas.find(this.filterAreaByPlaceCode(placeCode)).submitDisabled =
      true;

    forkJoin(
      this.changedActions
        .filter(this.filterEAPActionByPlaceCode(placeCode))
        .map(this.checkEAPAction),
    ).subscribe({
      next: () => this.actionResult(this.updateSuccessMessage),
      error: () => {
        void this.actionResult(this.updateFailureMessage);
        this.revertActionStatusIfFailed();
      },
    });
  }

  private revertActionStatusIfFailed() {
    const alertArea = this.alertAreas.find(
      (area) => area.placeCode === this.changedActions[0].placeCode,
    );
    for (const action of alertArea.eapActions) {
      if (this.changedActions.includes(action)) {
        action.checked = !action.checked;
      }
    }
  }

  private async actionResult(resultMessage: string): Promise<void> {
    const popover = await this.popoverController.create({
      component: ActionResultPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-normal',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        message: resultMessage,
      },
    });

    await popover.present();

    void popover.onDidDismiss().then(() => {
      this.placeCodeService.setPlaceCode(this.placeCode);
      this.changedActions = [];
    });
  }

  public getClearOutMessage(event: EventSummary) {
    if (!this.countryDisasterSettings?.showMonthlyEapActions) {
      return;
    }

    const droughtSeasonRegions =
      this.countryDisasterSettings?.droughtSeasonRegions;
    const forecastAreas = Object.keys(droughtSeasonRegions);

    const currentMonth = this.timelineState.today;
    const nextMonth = currentMonth.plus({
      months: 1,
    });

    const forecastMonthNumbers = [];
    for (const area of forecastAreas) {
      if (
        !event?.eventName ||
        event.eventName.toLowerCase().includes(area.toLowerCase())
      ) {
        for (const season of Object.keys(droughtSeasonRegions[area])) {
          const rainMonths = droughtSeasonRegions[area][season].rainMonths;
          const finalMonth = rainMonths[rainMonths.length - 1];
          if (
            currentMonth.month +
              Number(LeadTimeTriggerKey[event?.firstLeadTime]) <=
            finalMonth
          ) {
            forecastMonthNumbers.push(finalMonth);
          }
        }
      }
    }

    let translateKey: string;
    if (Object.values(forecastAreas).length === 1) {
      if (forecastMonthNumbers.includes(currentMonth.month - 1)) {
        translateKey = 'chat-component.drought.clear-out.national.message';
      } else if (forecastMonthNumbers.includes(nextMonth.month - 1)) {
        translateKey = 'chat-component.drought.clear-out.national.warning';
      }
    } else if (Object.values(forecastAreas).length > 1) {
      if (forecastMonthNumbers.includes(currentMonth.month - 1)) {
        translateKey = 'chat-component.drought.clear-out.regional.message';
      } else if (forecastMonthNumbers.includes(nextMonth.month - 1)) {
        translateKey = 'chat-component.drought.clear-out.regional.warning';
      } else {
        return;
      }
    }
    return translateKey
      ? (this.translateService.instant(translateKey) as string)
      : null;
  }

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

  public hasEap(): string {
    return this.disasterTypeService.hasEap(this.disasterType.disasterType);
  }
}
