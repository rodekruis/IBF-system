import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ActionResultPopoverComponent } from 'src/app/components/action-result-popover/action-result-popover.component';
import { ApiService } from 'src/app/services/api.service';
import { EventService } from 'src/app/services/event.service';
import { AlertArea } from 'src/app/types/alert-area';

@Component({
  selector: 'app-set-trigger-confirm-popover',
  templateUrl: './set-trigger-confirm-popover.component.html',
  styleUrls: ['./set-trigger-confirm-popover.component.scss'],
  standalone: false,
})
export class SetTriggerConfirmPopoverComponent {
  @Input()
  public adminAreaLabelPlural: string;
  @Input()
  public checkedAreas: AlertArea[];

  understood = false;

  constructor(
    private popoverController: PopoverController,
    private apiService: ApiService,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  public closePopover(): void {
    void this.popoverController.dismiss(null, 'cancel');
  }

  public confirm(): void {
    void this.popoverController.dismiss(null, 'confirm');
  }

  submitSetTriggerAreas(): void {
    console.log('Checked Areas:', this.checkedAreas);
    const eventPlaceCodeIds = this.checkedAreas.map(
      (area) => area.eventPlaceCodeId,
    );

    this.analyticsService.logEvent(AnalyticsEvent.aboutTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0, // REFACTOR: this is outdated
      component: this.constructor.name,
    });

    this.apiService.setTrigger(eventPlaceCodeIds).subscribe({
      next: () => {
        console.log('Set trigger success');
        this.actionResult(
          this.translateService.instant(
            `chat-component.common.set-trigger.popover-confirm.success`,
          ),
        );
      },
      error: () =>
        this.actionResult(
          this.translateService.instant(
            `chat-component.common.set-trigger.popover-confirm.error`,
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

    void popover.onDidDismiss().then(() => {
      window.location.reload();
    });
  }
}
