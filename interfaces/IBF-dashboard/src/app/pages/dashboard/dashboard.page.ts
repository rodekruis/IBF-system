import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  public isDev = false;
  private readonly adminRole = 'admin';

  constructor(private authService: AuthService) {
    this.authService.authenticationState$.subscribe((user) => {
      if (user) {
        this.isDev = user.role == this.adminRole;
      }
    });
  }
}
