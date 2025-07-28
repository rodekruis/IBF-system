import 'zone.js'; // Explicitly import zone.js to prevent NG0908
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AuthGuard } from './app/auth/auth.guard';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';

// Import all providers we need
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

// Factory functions
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function tokenGetter() {
  return localStorage.getItem('IBF-API-TOKEN');
}

// Bootstrap using modern Angular Elements approach for web components
(async () => {
  try {
    console.log('🚀 Initializing IBF Dashboard Web Component (Angular Elements + zone.js)...');
    
    // Create application with all necessary providers for Angular Elements
    const app = await createApplication({
      providers: [
        importProvidersFrom(BrowserModule),
        importProvidersFrom(HttpClientModule),
        importProvidersFrom(IonicModule.forRoot({ mode: 'md' })),
        importProvidersFrom(RouterModule.forRoot([
          {
            path: '',
            redirectTo: '/dashboard',
            pathMatch: 'full'
          },
          {
            path: 'test',
            loadComponent: () => {
              console.log('🧪 Loading test component...');
              return import('src/app/test-component.component').then(
                (m) => {
                  console.log('✅ Test component loaded successfully');
                  return m.TestComponent;
                }
              ).catch(error => {
                console.error('❌ Failed to load test component:', error);
                throw error;
              });
            },
          },
          {
            path: 'dashboard',
            loadChildren: () => {
              console.log('📊 Attempting to load dashboard module...');
              console.log('📂 Import path: src/app/pages/dashboard/dashboard.module');
              return import('src/app/pages/dashboard/dashboard.module').then(
                (m) => {
                  console.log('✅ Dashboard module imported successfully:', m);
                  console.log('🔍 Module exports:', Object.keys(m));
                  console.log('📋 DashboardPageModule:', m.DashboardPageModule);
                  return m.DashboardPageModule;
                }
              ).catch(error => {
                console.error('❌ Failed to load dashboard module:', error);
                console.error('📋 Error details:', {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });
                throw error;
              });
            }
          },
          {
            path: 'login',
            loadChildren: () =>
              import('src/app/pages/login/login.module').then(
                (m) => m.LoginPageModule,
              ),
          },
          {
            path: '**',
            redirectTo: '/dashboard'
          }
        ], { enableTracing: true })), // Enable router tracing for debugging
        importProvidersFrom(
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          })
        ),
        importProvidersFrom(
          JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              allowedDomains: ['ibf-test.510.global', 'ibf-api.rodekruis.nl'],
              disallowedRoutes: ['http://example.com/examplebadroute/']
            }
          })
        ),
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
      ]
    });
    
    // Create custom element from the AppComponent using the application injector
    const element = createCustomElement(AppComponent, { 
      injector: app.injector 
    });
    
    // Wrap the element to add embedded mode functionality
    const originalConnectedCallback = element.prototype.connectedCallback;
    const originalAttributeChangedCallback = element.prototype.attributeChangedCallback;
    
    // Override connectedCallback to set embedded mode
    element.prototype.connectedCallback = function() {
      // Set embedded mode immediately when component is connected
      document.documentElement.setAttribute('data-ibf-mode', 'embedded');
      document.documentElement.style.setProperty('--ibf-mode', 'embedded');
      
      // Set height from attribute or default
      const height = this.getAttribute('height') || '600px';
      document.documentElement.style.setProperty('--ibf-app-height', height);
      this.style.height = height;
      
      console.log('🎯 IBF Dashboard web component connected in EMBEDDED mode');
      console.log(`📏 Height set to: ${height}`);
      
      // Call original connectedCallback
      if (originalConnectedCallback) {
        originalConnectedCallback.call(this);
      }
    };
    
    // Override attributeChangedCallback to handle height changes
    element.prototype.attributeChangedCallback = function(name: string, oldValue: string, newValue: string) {
      if (name === 'height') {
        document.documentElement.style.setProperty('--ibf-app-height', newValue);
        this.style.height = newValue;
        console.log(`📏 Height updated to: ${newValue}`);
      }
      
      // Call original attributeChangedCallback
      if (originalAttributeChangedCallback) {
        originalAttributeChangedCallback.call(this, name, oldValue, newValue);
      }
    };
    
    // Add observedAttributes for height monitoring
    const originalObservedAttributes = element.observedAttributes || [];
    Object.defineProperty(element, 'observedAttributes', {
      value: [...originalObservedAttributes, 'height', 'width'],
      writable: false,
      enumerable: true,
      configurable: true
    });
    
    customElements.define('ibf-dashboard', element);
    
    console.log('✅ IBF Dashboard web component registered successfully with zone.js');
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-ready', {
      detail: { 
        version: environment.ibfSystemVersion, 
        timestamp: new Date(),
        approach: 'createApplication-with-zone.js'
      }
    }));
    
  } catch (error) {
    console.error('❌ Failed to register IBF Dashboard web component:', error);
    console.error('Error details:', error.stack);
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-error', {
      detail: { error: error.message, stack: error.stack, timestamp: new Date() }
    }));
  }
})();
