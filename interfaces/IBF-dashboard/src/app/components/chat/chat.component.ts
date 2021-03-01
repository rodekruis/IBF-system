import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
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
  private countrySubscription: Subscription;
  private placeCodeSubscription: Subscription;

  public indicatorName = IbfLayerName;
  public eapActions: EapAction[];
  public changedActions: EapAction[] = [];
  public submitDisabled = true;

  public leadTime: string;

  constructor(
    private countryService: CountryService,
    private eapActionsService: EapActionsService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private alertController: AlertController,
    public loadingCtrl: LoadingController,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
  ) {
    this.translateService
      .get('chat-component.active-event')
      .subscribe((translatedStrings: string) => {
        this.updateSuccessMessage = translatedStrings['update-success'];
        this.updateFailureMessage = translatedStrings['update-failure'];
        this.promptButtonLabel = translatedStrings['prompt-button-label'];
        this.closeEventPopup = translatedStrings['close-event-popup'];
      });
  }

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((_) => {
        this.eapActionsService.loadDistrictsAndActions();
        this.eventService.getTrigger();
      });

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
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
  }

  public changeAction(placeCode: string, action: string, checkbox: boolean) {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.eapAction, {
          placeCode: placeCode,
          eapAction: action,
          eapActionStatus: checkbox,
          page: AnalyticsPage.dashboard,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
        });
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

  public async submitEapAction(placeCode: string) {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.eapSubmit, {
          placeCode: placeCode,
          page: AnalyticsPage.dashboard,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
        });
      });

    this.triggeredAreas.find(
      (i) => i.placeCode === placeCode,
    ).submitDisabled = true;
    const activeCountry = this.countryService.getActiveCountry();

    try {
      const submitEAPActionResult = await Promise.all(
        this.changedActions.map(async (action) => {
          if (action.pcode === placeCode) {
            return this.eapActionsService.checkEapAction(
              action.action,
              activeCountry.countryCodeISO3,
              action.checked,
              action.pcode,
            );
          } else {
            return Promise.resolve();
          }
        }),
      );

      this.changedActions = this.changedActions.filter(
        (i) => i.pcode !== placeCode,
      );

      this.actionResult(this.updateSuccessMessage, (): void =>
        window.location.reload(),
      );
    } catch (e) {
      this.actionResult(this.updateFailureMessage);
    }
  }

  private async actionResult(resultMessage: string, callback?: () => void) {
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

    await alert.present();
  }

  public async closePlaceCodeEventPopup(area) {
    const message = await this.translateService
      .get('chat-component.active-event.close-event-popup.message', {
        placCodeName: area.name,
      })
      .toPromise();
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
            this.closePlaceCodeEvent(area.eventPlaceCodeId, area.placeCode);
          },
        },
      ],
    });
    await alert.present();
  }

  public async closePlaceCodeEvent(
    eventPlaceCodeId: string,
    placeCode: string,
  ) {
    let loading = await this.loadingCtrl.create({});
    loading.present();
    this.apiService.closeEventPlaceCode(eventPlaceCodeId).then(() => {
      loading.dismiss();
    });
    this.eapActionsService.loadDistrictsAndActions();
    this.eventService.getTrigger();
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.watchVideoGuide, {
          page: AnalyticsPage.dashboard,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
          placeCode: placeCode,
        });
      });
  }
}
