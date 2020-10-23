import { Component, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CountryService } from 'src/app/services/country.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { EapAction } from 'src/app/types/eap-action';
import { IndicatorEnum } from 'src/app/types/indicator-group';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy {
  public triggeredAreas: any[];

  private eapActionSubscription: Subscription;
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;

  public IndicatorEnum = IndicatorEnum;
  public eapActions: EapAction[];
  public changedActions: EapAction[] = [];
  public submitDisabled = true;

  public leadTime: string;
  public trigger: boolean;

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private eapActionsService: EapActionsService,
    private alertController: AlertController,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country) => {
        this.eapActionsService.loadDistrictsAndActions();
        this.getTrigger();
      });

    // this.timelineSubscription = this.timelineService
    //   .getTimelineSubscription()
    //   .subscribe((timeline) => {
    //     this.eapActionsService.loadDistrictsAndActions();
    //     this.getTrigger();
    //   });

    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe((newAreas) => {
        this.triggeredAreas = newAreas;
        this.triggeredAreas.forEach((area) => (area.submitDisabled = true));
      });
  }

  ngOnDestroy() {
    this.eapActionSubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
  }

  private async getTrigger() {
    this.trigger = !!(await this.timelineService.getEvent());

    const timestep = this.timelineService.state.selectedTimeStepButtonValue;
    // this.trigger = await this.timelineService.getTrigger(timestep);
    this.leadTime = timestep.replace('-day', ' days from today');
  }

  public changeAction(pcode: string, action: string, checkbox: boolean) {
    const area = this.triggeredAreas.find((i) => i.pcode === pcode);
    const changedAction = area.eapActions.find((i) => i.action === action);
    changedAction.checked = checkbox;
    if (!this.changedActions.includes(changedAction)) {
      this.changedActions.push(changedAction);
    }
    this.triggeredAreas.find((i) => i.pcode === pcode).submitDisabled = false;
  }

  public submitEapAction(pcode: string) {
    this.triggeredAreas.find((i) => i.pcode === pcode).submitDisabled = true;
    this.changedActions.forEach(async (action) => {
      if (action.pcode === pcode) {
        this.eapActionsService.checkEapAction(
          action.action,
          this.countryService.selectedCountry.countryCode,
          action.checked,
          action.pcode,
        );
      }
    });
    this.changedActions = this.changedActions.filter((i) => i.pcode !== pcode);
    this.actionResult('EAP action(s) updated in database.');
  }

  private async actionResult(resultMessage: string) {
    const alert = await this.alertController.create({
      message: resultMessage,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            alert.dismiss(true);
            window.location.reload();
            return false;
          },
        },
      ],
    });

    await alert.present();
  }
}
