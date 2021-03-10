import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { environment } from 'src/environments/environment';
import { VideoPopoverComponent } from '../video-popover/video-popover.component';

@Component({
  selector: 'video-guide-button',
  templateUrl: './video-guide-button.component.html',
  styleUrls: ['./video-guide-button.component.scss'],
})
export class VideoGuideButtonComponent {
  @Input()
  public color: string = 'ibf-royal-blue';

  constructor(
    private popoverController: PopoverController,
    private analyticsService: AnalyticsService,
    private countryService: CountryService,
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

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.watchVideoGuide, {
          page: AnalyticsPage.dashboard,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
          component: this.constructor.name,
        });
      });

    popover.present();
  }
}
