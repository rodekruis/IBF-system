import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { EventService } from 'src/app/services/event.service';
import { Country } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { VideoPopoverComponent } from '../video-popover/video-popover.component';

@Component({
  selector: 'app-ibf-guide-button',
  templateUrl: './ibf-guide-button.component.html',
  styleUrls: ['./ibf-guide-button.component.scss'],
})
export class IbfGuideButtonComponent {
  private countrySubscription: Subscription;
  private pdfUrl: string;
  private videoUrl: string;

  constructor(
    private countryService: CountryService,
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    if (country) {
      this.pdfUrl = country.notificationInfo.linkPdf;
      this.videoUrl = country.notificationInfo.linkVideo;
    }
  };

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: VideoPopoverComponent,
      componentProps: {
        videoUrl: this.videoUrl,
        pdfUrl: this.pdfUrl,
      },
      animated: true,
      cssClass: 'ibf-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.watchIbfGuide, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    popover.present();
  }
}
