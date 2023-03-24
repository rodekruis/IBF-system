import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { CommunityNotification } from '../../models/poi.model';
import { ApiService } from '../../services/api.service';
import { ActionResultPopoverComponent } from '../action-result-popover/action-result-popover.component';

@Component({
  selector: 'app-custom-popup',
  templateUrl: './custom-popup.component.html',
  styleUrls: ['./custom-popup.component.scss'],
})
export class CustomPopupComponent {
  @Input() markerProperties: CommunityNotification;

  public formattedDate: string;

  constructor(
    private popoverController: PopoverController,
    private apiService: ApiService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.formattedDate = DateTime.fromISO(
      this.markerProperties?.uploadTime,
    ).toFormat('d LLLL y, H:mm');
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
