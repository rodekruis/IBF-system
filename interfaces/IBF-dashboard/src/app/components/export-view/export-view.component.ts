import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-export-view',
  templateUrl: './export-view.component.html',
  styleUrls: ['./export-view.component.scss'],
})
export class ExportViewComponent {
  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: ExportViewPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
        this.eventService.state.event?.thresholdReached
          ? 'trigger-alert'
          : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.exportView, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    popover.present();
  }
}
