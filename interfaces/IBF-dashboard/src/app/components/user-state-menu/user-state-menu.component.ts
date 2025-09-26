import { Component, Input } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user/user.model';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-user-state-menu',
  templateUrl: './user-state-menu.component.html',
  standalone: false,
})
export class UserStateMenuComponent {
  @Input() user: null | User;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

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

  public getDisplayName = () => {
    if (!this.user) {
      return 'Unknown User';
    }

    return [this.user.firstName, this.user.middleName, this.user.lastName]
      .filter(Boolean)
      .join(' ');
  };
}
