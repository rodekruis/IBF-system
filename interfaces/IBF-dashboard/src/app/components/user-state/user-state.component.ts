import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { UserStateMenuComponent } from 'src/app/components/user-state-menu/user-state-menu.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-state',
  templateUrl: './user-state.component.html',
  standalone: false,
})
export class UserStateComponent {
  public environmentConfiguration = environment.configuration;
  public version = environment.ibfSystemVersion;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
  ) {}

  get userInitials() {
    return this.authService.userInitials;
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn;
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
}
