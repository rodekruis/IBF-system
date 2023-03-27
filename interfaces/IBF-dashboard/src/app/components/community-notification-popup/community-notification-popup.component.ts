import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { CommunityNotification } from '../../models/poi.model';
import { ApiService } from '../../services/api.service';
import { EventService } from '../../services/event.service';
import { ActionResultPopoverComponent } from '../action-result-popover/action-result-popover.component';
import { CommunityNotificationPhotoPopupComponent } from '../community-notification-photo-popup/community-notification-photo-popup.component';

@Component({
  selector: 'app-community-notification-popup',
  templateUrl: './community-notification-popup.component.html',
  styleUrls: ['./community-notification-popup.component.scss'],
})
export class CommunityNotificationPopupComponent implements OnInit {
  @Input() markerProperties: CommunityNotification;

  public formattedDate: string;

  constructor(
    private popoverController: PopoverController,
    private apiService: ApiService,
    private eventService: EventService,
  ) {}

  ngOnInit() {
    this.formattedDate = DateTime.fromISO(
      this.markerProperties?.uploadTime,
    ).toFormat('d LLLL y, H:mm');
  }

  public async openImagePopup(url: string) {
    const popover = await this.popoverController.create({
      component: CommunityNotificationPhotoPopupComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
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

  public dismissCommunityNotification(pointDataId: string) {
    this.apiService.dismissCommunityNotification(pointDataId).subscribe({
      next: () => this.actionResult('Dismissing notification succeeded'),
      error: () => this.actionResult('Dismissing notification failed'),
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
