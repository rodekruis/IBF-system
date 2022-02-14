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
import { Country, DisasterType } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { TimelineState } from 'src/app/types/timeline-state';
import { TimelineService } from '../../services/timeline.service';
import { LeadTimeUnit } from '../../types/lead-time';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public triggeredAreas: any[];
  public filteredAreas: any[];
  public activeDisasterType: string;
  public eventState: EventState;
  public timelineState: TimelineState;

  private translatedStrings: object;
  private updateSuccessMessage: string;
  private updateFailureMessage: string;
  private promptButtonLabel: string;
  private closeEventPopup: object;

  private countrySubscription: Subscription;
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private translateSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;

  public indicatorName = IbfLayerName;
  public eapActions: EapAction[];
  public changedActions: EapAction[] = [];
  public submitDisabled = true;
  public adminAreaLabel: string;
  public disasterTypeLabel: string;
  public disasterTypeName: string;
  public disasterCategory = '';
  private country: Country;
  private disasterType: DisasterType;
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
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
  ) {
    this.translateSubscription = this.translateService
      .get('chat-component')
      .subscribe(this.onTranslate);
  }

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
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
    this.timelineStateSubscription.unsubscribe();
  }

  private onTranslate = (translatedStrings) => {
    this.translatedStrings = translatedStrings;
    const activeEventsSelector = 'active-event';
    const closeEventPopupSelector = 'close-event-popup';
    const activeEvent = this.translatedStrings[activeEventsSelector];
    if (activeEvent) {
      this.closeEventPopup = activeEvent[closeEventPopupSelector];
    }
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    if (this.country && this.disasterType) {
      this.setupChatText();
    }
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  private onTriggeredAreasChange = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.setDefaultFilteredAreas();
    this.triggeredAreas.forEach(this.disableSubmitButtonForTriggeredArea);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    const activeLeadTime = this.timelineState?.timeStepButtons.find(
      (t) => t.value === this.timelineState?.activeLeadTime,
    );
    if (placeCode && activeLeadTime.alert) {
      const filterTriggeredAreasByPlaceCode = (triggeredArea) =>
        triggeredArea.placeCode === placeCode.placeCode;

      this.filteredAreas = this.triggeredAreas.filter(
        filterTriggeredAreasByPlaceCode,
      );
    } else {
      this.setDefaultFilteredAreas();
    }
    this.changeDetectorRef.detectChanges();
  };

  private setDefaultFilteredAreas = () => {
    if (this.eventService.isOldEvent()) {
      this.filteredAreas = [...this.triggeredAreas];
    } else {
      this.filteredAreas = [];
    }
  };

  private setupChatText = () => {
    const disasterType =
      this.disasterType?.disasterType ||
      this.country.disasterTypes[0].disasterType;
    const adminLevel = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).defaultAdminLevel;
    this.adminAreaLabel = this.country.adminRegionLabels[adminLevel].singular;
    this.changeDetectorRef.detectChanges();

    const disasterTypesWithSpecificText = [
      DisasterTypeKey.dengue,
      DisasterTypeKey.heavyRain,
      DisasterTypeKey.typhoon,
      DisasterTypeKey.malaria,
    ];
    this.disasterTypeLabel = this.disasterType.label;
    this.disasterTypeName = this.disasterType.disasterType;
    const activeEventsSelector = 'active-event';
    const updateSuccesSelector = 'update-success';
    const updateFailureSelector = 'update-failure';
    if (
      disasterTypesWithSpecificText.includes(
        this.disasterTypeName as DisasterTypeKey,
      )
    ) {
      this.updateSuccessMessage = this.translatedStrings[this.disasterTypeName][
        activeEventsSelector
      ][updateSuccesSelector];
      this.updateFailureMessage = this.translatedStrings[this.disasterTypeName][
        activeEventsSelector
      ][updateFailureSelector];
      this.disasterCategory = `${this.disasterTypeName}.`;
    } else {
      this.updateSuccessMessage = this.translatedStrings[activeEventsSelector][
        updateSuccesSelector
      ];
      this.updateFailureMessage = this.translatedStrings[activeEventsSelector][
        updateFailureSelector
      ];
      this.disasterCategory = '';
    }

    this.apiService
      .getRecentDates(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
      )
      .subscribe((date) => {
        this.onRecentDates(date, this.disasterType);
      });

    this.changeDetectorRef.detectChanges();
  };

  private onRecentDates = (date, disasterType: DisasterType) => {
    const recentDate = date.timestamp || date.date;
    this.lastModelRunDate = recentDate
      ? DateTime.fromISO(recentDate).toFormat(this.lastModelRunDateFormat)
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

  private onClosePlaceCodeEventPopupByTriggeredArea = (triggeredArea) => async (
    message,
  ): Promise<void> => {
    const cancelTranslateNode = 'cancel';
    const confirmTranslateNode = 'confirm';

    const alert = await this.alertController.create({
      message,
      buttons: [
        {
          text: this.closeEventPopup[cancelTranslateNode],
          handler: () => {
            console.log('Cancel close place code');
          },
        },
        {
          text: this.closeEventPopup[confirmTranslateNode],
          handler: () => {
            this.closePlaceCodeEvent(
              triggeredArea.eventPlaceCodeId,
              triggeredArea.placeCode,
            );
          },
        },
      ],
    });

    alert.present();
  };

  public closePlaceCodeEventPopup(triggeredArea): void {
    this.translateSubscription = this.translateService
      .get('chat-component.active-event.close-event-popup.message', {
        placeCodeName: triggeredArea.name,
      })
      .subscribe(this.onClosePlaceCodeEventPopupByTriggeredArea(triggeredArea));
  }

  public closePlaceCodeEvent(
    eventPlaceCodeId: string,
    placeCode: string,
  ): void {
    this.analyticsService.logEvent(AnalyticsEvent.closeEvent, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      placeCode,
    });
    const failureTranslateNode = 'failure';
    this.apiService.closeEventPlaceCode(eventPlaceCodeId).subscribe({
      next: () => this.reloadEapAndTrigger(),
      error: () =>
        this.actionResult(this.closeEventPopup[failureTranslateNode]),
    });
  }

  private reloadEapAndTrigger() {
    this.eapActionsService.loadAdminAreasAndActions();
    this.eventService.getTrigger();
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
}
