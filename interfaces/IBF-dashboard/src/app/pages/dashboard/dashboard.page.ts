import { Component, OnInit } from '@angular/core';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { User } from 'src/app/models/user/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public version: string = environment.ibfSystemVersion;
  public isDev = false;
  public isMultiCountry = false;
  private readonly adminRole = UserRole.Admin;
  public environmentConfiguration = environment.configuration;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
  ) {
    this.authService.getAuthSubscription().subscribe(this.onUserChange);
  }

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.dashboard);
  }

  private onUserChange = (user: User): void => {
    if (user) {
      this.isDev = user.userRole === this.adminRole;
      this.isMultiCountry = user.countries.length > 1;
    }
  };
}
