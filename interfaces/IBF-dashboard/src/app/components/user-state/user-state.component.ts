import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user.model';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-user-state',
  templateUrl: './user-state.component.html',
  styleUrls: ['./user-state.component.scss'],
})
export class UserStateComponent {
  public displayName: string;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
  ) {
    this.authService.authenticationState$.subscribe(this.setDisplayName);
  }

  setDisplayName = (user: User) => {
    this.displayName = user
      ? user.firstName +
        (user.middleName ? ' ' + user.middleName : '') +
        ' ' +
        user.lastName
      : '';
  };

  public doLogout() {
    this.loaderService.setLoader('logout', false);
    this.authService.logout();
    window.location.reload();
  }
}
