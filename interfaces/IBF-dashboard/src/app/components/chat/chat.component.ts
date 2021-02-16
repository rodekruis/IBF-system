import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';
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
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {
    this.translateService
      .get('chat-component.active-event')
      .subscribe((translatedStrings: string) => {
        this.updateSuccessMessage = translatedStrings['update-success'];
        this.updateFailureMessage = translatedStrings['update-failure'];
        this.promptButtonLabel = translatedStrings['prompt-button-label'];
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
            (area) => area.pcode === placeCode.placeCode,
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

  public changeAction(pcode: string, action: string, checkbox: boolean) {
    const area = this.triggeredAreas.find((i) => i.pcode === pcode);
    const changedAction = area.eapActions.find((i) => i.action === action);
    changedAction.checked = checkbox;
    if (!this.changedActions.includes(changedAction)) {
      this.changedActions.push(changedAction);
    } else {
      this.changedActions = this.changedActions.filter(
        (item) => !(changedAction.action === item.action),
      );
    }
    this.triggeredAreas.find((i) => i.pcode === pcode).submitDisabled =
      this.changedActions.length === 0;
  }

  public async submitEapAction(pcode: string) {
    this.triggeredAreas.find((i) => i.pcode === pcode).submitDisabled = true;
    const activeCountry = this.countryService.getActiveCountry();

    try {
      const submitEAPActionResult = await Promise.all(
        this.changedActions.map(async (action) => {
          if (action.pcode === pcode) {
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
        (i) => i.pcode !== pcode,
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
}
