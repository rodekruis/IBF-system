import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { DEFAULT_USER } from 'src/app/config';
import { User } from 'src/app/models/user/user.model';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-user-state-menu',
  templateUrl: './user-state-menu.component.html',
  standalone: false,
})
export class UserStateMenuComponent implements OnDestroy {
  private authSubscription: Subscription;
  public displayName: string;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {
    this.authSubscription = authService
      .getAuthSubscription()
      .subscribe(this.setDisplayName);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
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

  setDisplayName = (user: User) => {
    user = user ?? DEFAULT_USER;

    const displayName = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ');

    this.displayName = displayName;
  };
}
