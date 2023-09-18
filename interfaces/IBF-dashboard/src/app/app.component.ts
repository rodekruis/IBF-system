import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
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
      .subscribe(this.onLoaderChange);
  }

  private onLoaderChange = (loading: boolean) => {
    this.loading = loading;
  };

  initializeApp() {
    this.translateService.setDefaultLang(this.defaultLanguage);
    this.translateService.use(this.defaultLanguage);
    this.platform.ready();
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
