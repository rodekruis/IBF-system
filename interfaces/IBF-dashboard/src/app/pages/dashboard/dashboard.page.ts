import { Component } from '@angular/core';
import * as moment from 'moment';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  public version: string = environment.ibf_system_version;
  public isDev = false;
  private readonly adminRole = 'admin';
  public today: moment.Moment = moment();

  constructor(private authService: AuthService) {
    this.authService.authenticationState$.subscribe((user) => {
      if (user) {
        this.isDev = user.role == this.adminRole;
      }
    });
  }
}
