import { Component, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { IbfGuidePopoverComponent } from 'src/app/components/ibf-guide-popover/ibf-guide-popover.component';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-ibf-guide-button',
  templateUrl: './ibf-guide-button.component.html',
  styleUrls: ['./ibf-guide-button.component.scss'],
  standalone: false,
})
export class IbfGuideButtonComponent implements OnDestroy {
  private countrySubscription: Subscription;
  private videoUrl: string;
  private pdfUrl: string;

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
      component: IbfGuidePopoverComponent,
      componentProps: { videoUrl: this.videoUrl, pdfUrl: this.pdfUrl },
      animated: true,
      cssClass: 'ibf-popover ibf-popover-large',
      translucent: true,
      showBackdrop: true,
    });

    this.analyticsService.logEvent(AnalyticsEvent.watchIbfGuide, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    void popover.present();
  }
}
