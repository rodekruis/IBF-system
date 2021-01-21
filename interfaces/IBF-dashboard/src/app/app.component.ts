import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private loaderSubscription: Subscription;
  public loading = true;

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
  ) {
    this.initializeApp();
    this.loaderSubscription = this.loaderService
      .getLoaderSubscription()
      .pipe(debounceTime(500))
      .subscribe((loading: boolean) => {
        this.loading = loading;
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
