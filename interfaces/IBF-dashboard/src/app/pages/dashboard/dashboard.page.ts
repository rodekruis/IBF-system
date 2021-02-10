import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public version: string = environment.ibfSystemVersion;
  public isDev = false;
  private readonly adminRole = UserRole.Admin;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
  ) {
    this.authService.authenticationState$.subscribe((user) => {
      if (user) {
        this.isDev = user.userRole == this.adminRole;
      }
    });
  }

  ngOnInit() {
    this.analyticsService.logPageView('dashboard');
  }
}
