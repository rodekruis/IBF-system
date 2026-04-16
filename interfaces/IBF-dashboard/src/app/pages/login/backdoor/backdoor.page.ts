import { Component, OnInit } from '@angular/core';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-backdoor',
  templateUrl: './backdoor.page.html',
  styleUrls: ['./backdoor.page.scss'],
  standalone: false,
})
export class BackdoorPage implements OnInit {
  public version = environment.ibfSystemVersion;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.backdoor);
  }
}
