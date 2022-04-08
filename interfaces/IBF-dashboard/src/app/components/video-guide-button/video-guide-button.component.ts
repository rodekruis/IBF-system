import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { EventService } from 'src/app/services/event.service';
import { environment } from 'src/environments/environment';
import { VideoPopoverComponent } from '../video-popover/video-popover.component';

@Component({
  selector: 'app-video-guide-button',
  templateUrl: './video-guide-button.component.html',
  styleUrls: ['./video-guide-button.component.scss'],
})
export class VideoGuideButtonComponent {
  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: VideoPopoverComponent,
      componentProps: {
        videoUrl: environment.ibfVideoGuideUrl,
      },
      animated: true,
      cssClass: 'ibf-video-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.watchVideoGuide, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    popover.present();
  }
}
