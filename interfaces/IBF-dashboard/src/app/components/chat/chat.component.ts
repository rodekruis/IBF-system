import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
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
export class ChatComponent implements OnDestroy {
  public triggeredAreas: any[];
  public filteredAreas: any[];

  private updateSuccessMessage: string;
  private updateFailureMessage: string;
  private promptButtonLabel: string;
  private closeEventPopup: object;

  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private translateSubscription: Subscription;
  private closeEventPlaceCodeSubscription: Subscription;

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
      .subscribe((translatedStrings: string) => {
        this.updateSuccessMessage = translatedStrings['update-success'];
        this.updateFailureMessage = translatedStrings['update-failure'];
        this.promptButtonLabel = translatedStrings['prompt-button-label'];
        this.closeEventPopup = translatedStrings['close-event-popup'];
      });
  }

  ngOnInit() {
    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe((newAreas) => {
        this.triggeredAreas = newAreas;
        this.filteredAreas = [...this.triggeredAreas];
        this.triggeredAreas.forEach((area) => (area.submitDisabled = true));
      });

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((placeCode: PlaceCode) => {
        if (placeCode) {
          this.filteredAreas = this.triggeredAreas.filter(
            (area) => area.placeCode === placeCode.placeCode,
          );
        } else {
          this.filteredAreas = [...this.triggeredAreas];
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
    this.closeEventPlaceCodeSubscription.unsubscribe();
  }

  public changeAction(
    placeCode: string,
    action: string,
    checkbox: boolean,
  ): void {
    this.analyticsService.logEvent(AnalyticsEvent.eapAction, {
      placeCode: placeCode,
      eapAction: action,
      eapActionStatus: checkbox,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    const area = this.triggeredAreas.find((i) => i.placeCode === placeCode);
    const changedAction = area.eapActions.find((i) => i.action === action);
    changedAction.checked = checkbox;
    if (!this.changedActions.includes(changedAction)) {
      this.changedActions.push(changedAction);
    } else {
      this.changedActions = this.changedActions.filter(
        (item) => !(changedAction.action === item.action),
      );
    }
    this.triggeredAreas.find((i) => i.placeCode === placeCode).submitDisabled =
      this.changedActions.length === 0;
  }

  public submitEapAction(placeCode: string): void {
    this.analyticsService.logEvent(AnalyticsEvent.eapSubmit, {
      placeCode: placeCode,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.triggeredAreas.find(
      (i) => i.placeCode === placeCode,
    ).submitDisabled = true;

    try {
      this.changedActions.map((action) => {
        if (action.placeCode === placeCode) {
          return this.eapActionsService.checkEapAction(
            action.action,
            action.checked,
            action.placeCode,
          );
        }
      });

      this.changedActions = this.changedActions.filter(
        (i) => i.placeCode !== placeCode,
      );

      this.actionResult(this.updateSuccessMessage, (): void =>
        window.location.reload(),
      );
    } catch (e) {
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

  public closePlaceCodeEventPopup(area): void {
    this.translateSubscription = this.translateService
      .get('chat-component.active-event.close-event-popup.message', {
        placeCodeName: area.name,
      })
      .subscribe(
        async (message): Promise<void> => {
          const alert = await this.alertController.create({
            message: message,
            buttons: [
              {
                text: this.closeEventPopup['cancel'],
                handler: () => {
                  console.log('Cancel close place code');
                },
              },
              {
                text: this.closeEventPopup['confirm'],
                handler: () => {
                  this.closePlaceCodeEvent(
                    area.eventPlaceCodeId,
                    area.placeCode,
                  );
                },
              },
            ],
          });

          alert.present();
        },
      );
  }

  public closePlaceCodeEvent(
    eventPlaceCodeId: string,
    placeCode: string,
  ): void {
    this.loaderService.setLoader('closePlaceCodeEvent', true);
    this.closeEventPlaceCodeSubscription = this.apiService
      .closeEventPlaceCode(eventPlaceCodeId)
      .subscribe(() => {
        this.loaderService.setLoader('closePlaceCodeEvent', false);
      });
    this.eapActionsService.loadDistrictsAndActions();
    this.eventService.getTrigger();
    this.analyticsService.logEvent(AnalyticsEvent.closeEvent, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      placeCode: placeCode,
    });
  }
}
