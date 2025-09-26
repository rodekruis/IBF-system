import { Component, OnInit } from '@angular/core';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  standalone: false,
})
export class ManagePage implements OnInit {
  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.manage);
  }
}
