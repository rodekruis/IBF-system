import { Component } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user/user.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
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
    private countryService: CountryService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {
    this.authService.getAuthSubscription().subscribe((user: User) => {
      this.setDisplayName(user);
    });
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
    this.analyticsService.logEvent(AnalyticsEvent.logOut, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.loaderService.setLoader('logout', false);
    this.authService.logout();
    window.location.reload();
  }
}
