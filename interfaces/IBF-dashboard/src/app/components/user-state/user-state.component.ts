import { Component, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserStateMenuComponent } from 'src/app/components/user-state-menu/user-state-menu.component';
import { DEFAULT_USER } from 'src/app/config';
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
  public displayInitials: string;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
  ) {
    this.authSubscription = authService
      .getAuthSubscription()
      .subscribe(this.setDisplayInitials);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  public async showUserStateMenu(event: Event) {
    const userStateMenu = await this.popoverController.create({
      component: UserStateMenuComponent,
      event,
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      dismissOnSelect: true,
      showBackdrop: false,
    });

    await userStateMenu.present();
  }

  private setDisplayInitials = (user: User) => {
    user = user ?? DEFAULT_USER;

    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join('');

    this.displayInitials = initials;
  };

  public isLoggedIn = () => this.authService.isLoggedIn();
}
