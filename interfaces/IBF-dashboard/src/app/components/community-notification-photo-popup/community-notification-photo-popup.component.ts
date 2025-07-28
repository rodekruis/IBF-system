import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-community-notification-photo-popup',
  templateUrl: './community-notification-photo-popup.component.html',
  styleUrls: ['./community-notification-photo-popup.component.scss'],
  standalone: false,
})
export class CommunityNotificationPhotoPopupComponent implements OnChanges {
  @Input() url: string;

  constructor(private popoverController: PopoverController) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    // No specific logic needed for photo popup
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
