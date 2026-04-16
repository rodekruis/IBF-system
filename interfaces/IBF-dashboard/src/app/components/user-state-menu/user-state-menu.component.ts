import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ChangePasswordPopoverComponent } from 'src/app/components/change-password-popover/change-password-popover.component';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-user-state-menu',
  templateUrl: './user-state-menu.component.html',
  standalone: false,
})
export class UserStateMenuComponent {
  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private popoverController: PopoverController,
  ) {}

  get userName() {
    return this.authService.userName;
  }

  public logout() {
    this.analyticsService.logEvent(AnalyticsEvent.logOut, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    this.loaderService.setLoader('logout', false);
    this.authService.logout();
    window.location.reload();
  }

  public async presentPopover() {
    const popover = await this.popoverController.create({
      component: ChangePasswordPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-normal',
      translucent: true,
      showBackdrop: true,
    });

    void popover.present();
  }
}
