import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { VideoPopoverComponent } from 'src/app/components/video-popover/video-popover.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public version: string = environment.ibfSystemVersion;

  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.login);
  }

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
      page: AnalyticsPage.login,
      component: this.constructor.name,
    });

    popover.present();
  }
}
