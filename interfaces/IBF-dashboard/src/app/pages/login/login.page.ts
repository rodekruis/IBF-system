import { Component, OnInit } from '@angular/core';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  public version = environment.ibfSystemVersion;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.login);
  }
}
