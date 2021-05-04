import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DEBOUNCE_TIME_LOADER } from 'src/app/config';
import { LoaderService } from 'src/app/services/loader.service';

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
  ) {
    this.initializeApp();
    this.loaderSubscription = this.loaderService
      .getLoaderSubscription()
      .pipe(debounceTime(DEBOUNCE_TIME_LOADER))
      .subscribe(this.onLoaderChange);
  }

  private onLoaderChange = (loading: boolean) => {
    this.loading = loading;
  };

  initializeApp() {
    this.translateService.setDefaultLang(this.defaultLanguage);
    this.translateService.use(this.defaultLanguage);
    this.platform.ready().then(() => {});
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
