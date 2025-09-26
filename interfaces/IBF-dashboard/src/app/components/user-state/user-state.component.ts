import { Component, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserStateMenuComponent } from 'src/app/components/user-state-menu/user-state-menu.component';
import { User } from 'src/app/models/user/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-state',
  templateUrl: './user-state.component.html',
  standalone: false,
})
export class UserStateComponent implements OnDestroy {
  private authSubscription: Subscription;
  public environmentConfiguration = environment.configuration;
  public version = environment.ibfSystemVersion;
  private user: null | User = null;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
  ) {
    this.authSubscription = authService
      .getAuthSubscription()
      .subscribe(this.onAuthChange);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  onAuthChange = (user: null | User) => {
    this.user = user;
  };

  public async showUserStateMenu(event: Event) {
    const userStateMenu = await this.popoverController.create({
      component: UserStateMenuComponent,
      componentProps: { user: this.user },
      event,
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      dismissOnSelect: true,
      showBackdrop: false,
    });

    await userStateMenu.present();
  }

  public getUserInitials = () => {
    if (!this.user) {
      return 'UU'; // unknown user
    }

    return [this.user.firstName, this.user.lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join('');
  };

  public isLoggedIn = () => this.authService.isLoggedIn();
}
