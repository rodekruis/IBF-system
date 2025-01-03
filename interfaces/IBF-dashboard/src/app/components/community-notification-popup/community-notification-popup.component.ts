import { Component, Input, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { ActionResultPopoverComponent } from 'src/app/components/action-result-popover/action-result-popover.component';
import { CommunityNotificationPhotoPopupComponent } from 'src/app/components/community-notification-photo-popup/community-notification-photo-popup.component';
import { CommunityNotification } from 'src/app/models/poi.model';
import { ApiService } from 'src/app/services/api.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-community-notification-popup',
  templateUrl: './community-notification-popup.component.html',
  styleUrls: ['./community-notification-popup.component.scss'],
  standalone: false,
})
export class CommunityNotificationPopupComponent implements OnInit {
  @Input() markerProperties: CommunityNotification;

  public formattedDate: string;

  private alertDismissRole = {
    cancel: 'cancel',
    confirm: 'confirm',
  };

  constructor(
    private popoverController: PopoverController,
    private alertController: AlertController,
    private apiService: ApiService,
    private eventService: EventService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.formattedDate = DateTime.fromISO(
      this.markerProperties?.uploadTime,
    ).toFormat('d LLLL y, HH:mm');
  }

  public async openPhotoPopup(url: string) {
    const popover = await this.popoverController.create({
      component: CommunityNotificationPhotoPopupComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-large ${
        this.eventService.state.thresholdReached ? 'trigger-alert' : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        url,
      },
    });

    popover.present();
  }

  public async dismissCommunityNotification(pointDataId: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant(
        'map-popups.community-notification.delete',
      ),
      message: this.translate.instant(
        'map-popups.community-notification.delete-question',
      ),
      buttons: [
        {
          text: this.translate.instant(
            'map-popups.community-notification.delete-cancel',
          ),
          role: this.alertDismissRole.cancel,
        },
        {
          text: this.translate.instant(
            'map-popups.community-notification.delete-confirm',
          ),
          role: this.alertDismissRole.confirm,
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (!role || role !== this.alertDismissRole.confirm) {
      return;
    }

    this.apiService.dismissCommunityNotification(pointDataId).subscribe({
      next: () =>
        this.actionResult(
          this.translate.instant(
            'map-popups.community-notification.delete-successs',
          ),
        ),
      error: () =>
        this.actionResult(
          this.translate.instant(
            'map-popups.community-notification.delete-fail',
          ),
        ),
    });
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

    popover.onDidDismiss().then(() => {
      window.location.reload();
    });
  }
}
