import { Component, OnDestroy } from '@angular/core';
import { AnimationController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  private loaderSubscription: Subscription;
  public loading = true;
  private defaultLanguage = 'en';
  public routerAnimation = (
    _baseEl: HTMLElement,
    opts?: { leavingEl: HTMLElement; enteringEl: HTMLElement },
  ) => {
    const animationDuration = 200;
    const leavingAnimation = this.animationController
      .create()
      .addElement(opts.leavingEl)
      .duration(animationDuration)
      .easing('ease-out')
      .fromTo('opacity', 1, 0);
    const enteringAnimation = this.animationController
      .create()
      .addElement(opts.enteringEl)
      .duration(animationDuration)
      .easing('ease-out')
      .fromTo('opacity', 0, 1);

    return this.animationController
      .create()
      .duration(animationDuration)
      .addAnimation([leavingAnimation, enteringAnimation]);
  };

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private animationController: AnimationController,
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
