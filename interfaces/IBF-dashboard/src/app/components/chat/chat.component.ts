import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { forkJoin, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
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
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { TimelineState } from 'src/app/types/timeline-state';
import { AggregatesService } from '../../services/aggregates.service';
import { TimelineService } from '../../services/timeline.service';
import { Indicator } from '../../types/indicator-group';
import { LeadTimeUnit } from '../../types/lead-time';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public triggeredAreas: any[];
  public activeAreas: any[];
  public filteredActiveAreas: any[];
  public stoppedAreas: any[];
  public filteredStoppedAreas: any[];
  public activeDisasterType: string;
  public eventState: EventState;
  private timelineState: TimelineState;
  private indicators: Indicator[];
  public otherLeadTimes: string;

  private updateSuccessMessage: string;
  private updateFailureMessage: string;
  private promptButtonLabel: string;

  private countrySubscription: Subscription;
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private disasterTypeSubscription: Subscription;
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
  public actionIndicatorLabel: string;
  public clearOutMessage: string;
  public forecastInfo: string[];
  public country: Country;
  public disasterType: DisasterType;
  public disasterTypeSettings: CountryDisasterSettings;
  public lastModelRunDate: string;
  private lastModelRunDateFormat = 'cccc, dd LLLL HH:mm';
  public isWarn = false;

  constructor(
    private eapActionsService: EapActionsService,
    public authService: AuthService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
    private timelineService: TimelineService,
    private countryService: CountryService,
    private aggregatesService: AggregatesService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);

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
    this.disasterTypeSettings = this.country?.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
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

  private onTriggeredAreasChange = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.triggeredAreas.forEach((area) => {
      this.disableSubmitButtonForTriggeredArea(area);
    });
    this.stoppedAreas = this.triggeredAreas.filter((area) => area.stopped);
    this.activeAreas = this.triggeredAreas.filter((area) => !area.stopped);
    this.setDefaultFilteredAreas();
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    const activeLeadTime = this.timelineState?.timeStepButtons.find(
      (t) => t.value === this.timelineState?.activeLeadTime,
    );
    if (placeCode && activeLeadTime.alert) {
      const filterTriggeredAreasByPlaceCode = (triggeredArea) =>
        triggeredArea.placeCode === placeCode.placeCode;

      this.filteredActiveAreas = this.activeAreas.filter(
        filterTriggeredAreasByPlaceCode,
      );
      this.filteredStoppedAreas = this.stoppedAreas.filter(
        filterTriggeredAreasByPlaceCode,
      );
    } else {
      this.setDefaultFilteredAreas();
    }
    this.changeDetectorRef.detectChanges();
  };

  private setDefaultFilteredAreas = () => {
    if (this.eventService.isOldEvent()) {
      this.filteredActiveAreas = [...this.triggeredAreas];
      this.filteredStoppedAreas = [];
    } else {
      this.filteredActiveAreas = [];
      this.filteredStoppedAreas = [];
    }
  };

  private setupChatText = () => {
    if (
      this.country &&
      this.disasterType &&
      this.indicators.length &&
      this.timelineState
    ) {
      const adminLevel = this.disasterTypeSettings.defaultAdminLevel;
      this.adminAreaLabel = this.country.adminRegionLabels[adminLevel].singular;
      this.adminAreaLabelPlural = this.country.adminRegionLabels[
        adminLevel
      ].plural.toLowerCase();
      this.changeDetectorRef.detectChanges();

      this.disasterTypeLabel = this.disasterType.label;
      this.disasterTypeName = this.disasterType.disasterType;
      const actionIndicator = this.indicators.find((indicator) => {
        return indicator.name === this.disasterType.actionsUnit;
      });
      this.actionIndicatorLabel = actionIndicator?.label.toLowerCase();
      this.clearOutMessage = this.getClearOutMessage();
      this.getForecastInfo();

      this.updateSuccessMessage = this.translateService.instant(
        `chat-component.${this.disasterTypeName}.active-event.update-success`,
      );
      this.updateFailureMessage = this.translateService.instant(
        `chat-component.${this.disasterTypeName}.active-event.update-failure`,
      );

      this.otherLeadTimes = this.timelineState.timeStepButtons
        .filter(
          (b) => b.alert && b.value !== this.eventState.event.firstLeadTime,
        )
        .map((b) =>
          this.eventService.getFirstLeadTimeDate(b.value, LeadTimeUnit.month),
        )
        .join(' and ');

      this.setLastModelRunDate(this.disasterType);

      this.changeDetectorRef.detectChanges();
    }
  };

  private setLastModelRunDate = (disasterType: DisasterType) => {
    const recentDate = this.timelineState.today;
    this.lastModelRunDate = recentDate
      ? recentDate.toFormat(this.lastModelRunDateFormat)
      : 'unknown';
    this.isLastModelDateStale(recentDate, disasterType);
  };

  private disableSubmitButtonForTriggeredArea = (triggeredArea) =>
    (triggeredArea.submitDisabled = true);

  private filterTriggeredAreaByPlaceCode = (placeCode) => (triggeredArea) =>
    triggeredArea.placeCode === placeCode;

  private filterChangedEAPActionByChangedEAPAction = (changedAction) => (
    eapAction,
  ) => !(eapAction.action === changedAction.action);

  private filterEAPActionByEAPAction = (action) => (eapAction) =>
    eapAction.action === action;

  private filterEAPActionByPlaceCode = (placeCode) => (eapAction) =>
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
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    const filterTriggeredAreaByPlaceCode = this.filterTriggeredAreaByPlaceCode(
      placeCode,
    );

    const triggeredArea = this.triggeredAreas.find(
      filterTriggeredAreaByPlaceCode,
    );
    const changedAction = triggeredArea.eapActions.find(
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
    this.triggeredAreas.find(filterTriggeredAreaByPlaceCode).submitDisabled =
      this.changedActions.length === 0;
    this.changeDetectorRef.detectChanges();
  }

  private checkEAPAction = (action) => {
    return this.eapActionsService.checkEapAction(
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
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.triggeredAreas.find(
      this.filterTriggeredAreaByPlaceCode(placeCode),
    ).submitDisabled = true;

    forkJoin(
      this.changedActions
        .filter(this.filterEAPActionByPlaceCode(placeCode))
        .map(this.checkEAPAction),
    ).subscribe({
      next: () => this.actionResult(this.updateSuccessMessage),
      error: () => this.actionResult(this.updateFailureMessage),
    });
  }

  private async actionResult(resultMessage: string): Promise<void> {
    const alert = await this.alertController.create({
      message: resultMessage,
      buttons: [
        {
          text: this.promptButtonLabel,
          handler: () => {
            alert.dismiss(true);
            return false;
          },
        },
      ],
    });

    alert.present();
  }

  public async openStopTriggerPopup(triggeredArea): Promise<void> {
    const message = this.translateService.instant(
      `chat-component.${this.disasterTypeName}.active-event.stop-trigger-popup.message`,
      {
        placeCodeName: triggeredArea.name,
      },
    );
    const alert = await this.alertController.create({
      message,
      buttons: [
        {
          text: this.translateService.instant(
            `chat-component.${this.disasterTypeName}.active-event.stop-trigger-popup.cancel`,
          ),
          handler: () => {
            console.log('Cancel stop trigger');
          },
        },
        {
          text: this.translateService.instant(
            `chat-component.${this.disasterTypeName}.active-event.stop-trigger-popup.confirm`,
          ),
          handler: () => {
            this.stopTrigger(
              triggeredArea.eventPlaceCodeId,
              triggeredArea.placeCode,
            );
          },
        },
      ],
    });

    alert.present();
  }

  public stopTrigger(eventPlaceCodeId: string, placeCode: string): void {
    this.analyticsService.logEvent(AnalyticsEvent.stopTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      placeCode,
    });
    this.apiService.stopTrigger(eventPlaceCodeId).subscribe({
      next: () => this.reloadEapAndTrigger(),
      error: () =>
        this.actionResult(
          this.translateService.instant(
            `chat-component.${this.disasterTypeName}.active-event.stop-trigger-popup.failure`,
          ),
        ),
    });
  }

  private reloadEapAndTrigger() {
    this.eapActionsService.getTriggeredAreasApi();
    this.eventService.getTrigger();
    this.placeCodeService.clearPlaceCode();
  }

  public getClearOutMessage() {
    if (!this.disasterTypeSettings.showMonthlyEapActions) {
      return;
    }
    const forecastSeasonAreas = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).droughtForecastMonths;
    let forecastMonthNumbers = [];
    for (const area of Object.values(forecastSeasonAreas)) {
      const forecastSeasons = area.map((months) => months[months.length - 1]);
      forecastMonthNumbers = [...forecastMonthNumbers, ...forecastSeasons];
    }

    const currentMonth = this.timelineState.today.month;
    const nextMonth = this.timelineState.today.plus({ months: 1 }).month;
    let translateKey;
    if (Object.values(forecastSeasonAreas).length === 1) {
      if (forecastMonthNumbers.includes(currentMonth)) {
        translateKey = 'chat-component.drought.clear-out.national.message';
      } else if (forecastMonthNumbers.includes(nextMonth)) {
        translateKey = 'chat-component.drought.clear-out.national.warning';
      }
    } else if (Object.values(forecastSeasonAreas).length > 1) {
      // The cut-off for relevant month is one month different for ETH then for KEN
      // (due to end-of-month vs middle-of-mont?? MUST BE IMPROVED...)
      if (forecastMonthNumbers.includes(currentMonth - 1)) {
        translateKey = 'chat-component.drought.clear-out.regional.message';
      } else if (forecastMonthNumbers.includes(nextMonth - 1)) {
        translateKey = 'chat-component.drought.clear-out.regional.warning';
      } else {
        return;
      }
    }
    return translateKey ? this.translateService.instant(translateKey) : null;
  }

  private isLastModelDateStale = (recentDate, disasterType: DisasterType) => {
    const percentageOvertimeAllowed = 0.1; // 10%

    const updateFrequencyUnit = disasterType.leadTimes[0].leadTimeName.split(
      '-',
    )[1] as LeadTimeUnit;

    const durationUnit =
      updateFrequencyUnit === LeadTimeUnit.day
        ? 'days'
        : updateFrequencyUnit === LeadTimeUnit.hour
        ? 'hours'
        : updateFrequencyUnit === LeadTimeUnit.month
        ? 'months'
        : null;
    const durationUnitValue =
      updateFrequencyUnit === LeadTimeUnit.day
        ? 1
        : updateFrequencyUnit === LeadTimeUnit.hour
        ? 12
        : updateFrequencyUnit === LeadTimeUnit.month
        ? 1
        : null;

    const nowDate = DateTime.now();
    const diff = nowDate
      .diff(DateTime.fromISO(recentDate), durationUnit)
      .toObject();
    if (diff[durationUnit] > durationUnitValue + percentageOvertimeAllowed) {
      this.isWarn = true;
    } else {
      this.isWarn = false;
    }
  };

  public getForecastInfo() {
    if (!this.disasterTypeSettings.monthlyForecastInfo) {
      return;
    }

    const currentMonth = this.timelineState.today.month;

    const prefixKey = 'prefix';
    const prefix = this.disasterTypeSettings.monthlyForecastInfo[prefixKey];

    this.forecastInfo = this.disasterTypeSettings.monthlyForecastInfo[
      currentMonth
    ].map((forecast) => this.translateService.instant(`${prefix}.${forecast}`));
  }

  public getNumberOfActions(nrActions: number, nrForecasts: number) {
    const text = this.translateService.instant(
      'chat-component.drought.active-event.forecast-info.actions',
      {
        nrActions,
      },
    );
    if (!nrForecasts) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    } else {
      return text;
    }
  }
}
