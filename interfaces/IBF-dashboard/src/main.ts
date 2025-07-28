import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorService } from 'src/app/services/auth.interceptor.service';
import { LoaderInterceptorService } from 'src/app/services/loader.interceptor.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { addIcons } from 'ionicons';
import { 
  apps, 
  person, 
  eye, 
  informationCircleOutline, 
  arrowForward, 
  arrowBack, 
  warning, 
  closeCircle,
  chevronBackOutline,
  chevronDownOutline,
  chevronUpOutline
} from 'ionicons/icons';

// Register ionicons to prevent console warnings
addIcons({
  'apps': apps,
  'person': person,
  'eye': eye,
  'information-circle-outline': informationCircleOutline,
  'arrow-forward': arrowForward,
  'arrow-back': arrowBack,
  'warning': warning,
  'close-circle': closeCircle,
  'chevron-back-outline': chevronBackOutline,
  'chevron-down-outline': chevronDownOutline,
  'chevron-up-outline': chevronUpOutline
});

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

if (['production', 'stage'].includes(environment.configuration)) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    importProvidersFrom(IonicModule.forRoot({ mode: 'md' })),
    importProvidersFrom(AppRoutingModule),
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled:
          environment.configuration === 'production' &&
          environment.useServiceWorker,
      })
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
      })
    ),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
.catch((error: unknown) => {
  console.log(error);
});
