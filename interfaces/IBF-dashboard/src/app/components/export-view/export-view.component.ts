import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-export-view',
  templateUrl: './export-view.component.html',
  styleUrls: ['./export-view.component.scss'],
})
export class ExportViewComponent {
  constructor(
    private popoverController: PopoverController,
    private countryService: CountryService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: ExportViewPopoverComponent,
      animated: true,
      cssClass: 'ibf-export-view-popover',
      translucent: true,
      showBackdrop: true,
    });

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.exportView, {
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
