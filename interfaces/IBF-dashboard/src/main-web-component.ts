import { createCustomElement } from '@angular/elements';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app/app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Token getter function for JWT
export function tokenGetter() {
  return localStorage.getItem('jwt');
}

(async () => {
  try {
    console.log('🚀 Initializing IBF Dashboard Web Component...');
    
    const appRef = await bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(BrowserModule),
        importProvidersFrom(HttpClientModule),
        importProvidersFrom(IonicModule.forRoot()),
        importProvidersFrom(AppRoutingModule),
        importProvidersFrom(
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient],
            },
          })
        ),
        importProvidersFrom(
          JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              allowedDomains: ['ibf-test.510.global', 'ibf-api.rodekruis.nl'],
              disallowedRoutes: ['http://example.com/examplebadroute/'],
            },
          })
        ),
      ]
    });
    
    const element = createCustomElement(AppComponent, { 
      injector: appRef.injector 
    });
    
    customElements.define('ibf-dashboard', element);
    
    console.log('✅ IBF Dashboard web component registered successfully');
    
    // Emit a global event to notify that the component is ready
    window.dispatchEvent(new CustomEvent('ibf-dashboard-ready', {
      detail: { version: '1.0.0', timestamp: new Date() }
    }));
    
  } catch (error) {
    console.error('❌ Failed to register IBF Dashboard web component:', error);
    
    // Emit error event for debugging
    window.dispatchEvent(new CustomEvent('ibf-dashboard-error', {
      detail: { error: error.message, timestamp: new Date() }
    }));
  }
})();
