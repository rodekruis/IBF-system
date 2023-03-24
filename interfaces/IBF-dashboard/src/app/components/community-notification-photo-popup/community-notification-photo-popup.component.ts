import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-community-notification-photo-popup',
  templateUrl: './community-notification-photo-popup.component.html',
  styleUrls: ['./community-notification-photo-popup.component.scss'],
})
export class CommunityNotificationPhotoPopup {
  @Input() url: string;

  constructor(private popoverController: PopoverController) {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
