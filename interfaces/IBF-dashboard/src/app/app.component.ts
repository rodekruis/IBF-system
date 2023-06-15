import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { DashboardState, LoadCountries } from './store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private loaderSubscription: Subscription;
  public loading = true;
  private defaultLanguage = 'en';

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private store: Store<DashboardState>,
  ) {
    this.initializeApp();
    this.loaderSubscription = this.loaderService
      .getLoaderSubscription()
      .subscribe(this.onLoaderChange);
  }

  private onLoaderChange = (loading: boolean) => {
    this.loading = loading;
  };

  initializeApp() {
    this.translateService.setDefaultLang(this.defaultLanguage);
    this.translateService.use(this.defaultLanguage);
    this.platform.ready().then(() => {});
    this.store.dispatch(new LoadCountries());
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
