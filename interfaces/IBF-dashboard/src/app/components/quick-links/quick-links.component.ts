import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsEvent } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-quick-links',
  imports: [IonicModule, TranslateModule],
  templateUrl: './quick-links.component.html',
})
export class QuickLinksComponent {
  public analyticsEvent = AnalyticsEvent;
  public supportEmailAddress = environment.supportEmailAddress;

  constructor(private analyticsService: AnalyticsService) {}

  public onButtonClick(href: string, analyticsEvent: AnalyticsEvent) {
    this.analyticsService.logEvent(analyticsEvent, {
      component: this.constructor.name,
    });

    window.open(href);
  }
}
