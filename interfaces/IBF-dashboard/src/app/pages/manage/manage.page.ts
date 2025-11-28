import { Component, OnInit } from '@angular/core';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  standalone: false,
})
export class ManagePage implements OnInit {
  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.manage);
  }

  get isAdmin() {
    return this.authService.isAdmin;
  }
}
