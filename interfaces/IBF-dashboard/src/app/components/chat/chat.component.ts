import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { EapAction } from 'src/app/types/eap-action';
import { IbfLayerName } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public triggeredAreas: any[];
  public filteredAreas: any[];

  private updateSuccessMessage: string;
  private updateFailureMessage: string;
  private promptButtonLabel: string;
  private closeEventPopup: object;

  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private translateSubscription: Subscription;

  public indicatorName = IbfLayerName;
  public eapActions: EapAction[];
  public changedActions: EapAction[] = [];
  public submitDisabled = true;

  constructor(
    private eapActionsService: EapActionsService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
  ) {
    this.translateSubscription = this.translateService
      .get('chat-component.active-event')
      .subscribe(this.onTranslate);
  }

  ngOnInit() {
    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }

  ngOnDestroy() {
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
  }

  private onTranslate = (translatedStrings) => {
    this.updateSuccessMessage = translatedStrings['update-success'];
    this.updateFailureMessage = translatedStrings['update-failure'];
    this.promptButtonLabel = translatedStrings['prompt-button-label'];
    this.closeEventPopup = translatedStrings['close-event-popup'];
  };

  private onTriggeredAreasChange = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.filteredAreas = [...this.triggeredAreas];
    this.triggeredAreas.forEach(this.disableSubmitButtonForTriggeredArea);
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    if (placeCode) {
      const filterTriggeredAreasByPlaceCode = (triggeredArea) =>
        triggeredArea.placeCode === placeCode.placeCode;

      this.filteredAreas = this.triggeredAreas.filter(
        filterTriggeredAreasByPlaceCode,
      );
    } else {
      this.filteredAreas = [...this.triggeredAreas];
    }
    this.changeDetectorRef.detectChanges();
  };

  // data needs to be reorganized to avoid the mess that follows

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
    eapAction.placeCode !== placeCode;

  private checkEAPActionByPlaceCode = (placeCode) => (eapAction) => {
    if (eapAction.placeCode === placeCode) {
      return this.eapActionsService.checkEapAction(
        eapAction.action,
        eapAction.checked,
        eapAction.placeCode,
      );
    }
  };

  private onEAPActionComplete = (): void => window.location.reload();

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
  }

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

    try {
      this.changedActions.map(this.checkEAPActionByPlaceCode(placeCode));

      this.changedActions = this.changedActions.filter(
        this.filterEAPActionByPlaceCode(placeCode),
      );

      this.actionResult(this.updateSuccessMessage, this.onEAPActionComplete);
    } catch {
      this.actionResult(this.updateFailureMessage);
    }
  }

  private async actionResult(
    resultMessage: string,
    callback?: () => void,
  ): Promise<void> {
    const alert = await this.alertController.create({
      message: resultMessage,
      buttons: [
        {
          text: this.promptButtonLabel,
          handler: () => {
            alert.dismiss(true);
            if (callback) {
              callback();
            }
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

    this.apiService.closeEventPlaceCode(eventPlaceCodeId);
    this.eapActionsService.loadDistrictsAndActions();
    this.eventService.getTrigger();
  }
}
