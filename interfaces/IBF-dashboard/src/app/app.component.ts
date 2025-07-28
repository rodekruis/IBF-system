import { Component, OnDestroy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { PlatformDetectionService } from 'src/app/services/platform-detection.service';
import { IonApp, IonSpinner, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonSpinner, IonRouterOutlet, TranslateModule, CommonModule],
})
export class AppComponent implements OnInit, OnChanges, OnDestroy {
  // Web component inputs for external configuration
  @Input() countryCode: string = 'PHL';
  @Input() disasterType: string = 'typhoon';
  @Input() apiBaseUrl: string = 'https://ibf-api.rodekruis.nl';
  
  // EspoCRM integration inputs
  @Input() authToken: string = '';
  @Input() userId: string = '';
  @Input() embedPlatform: 'standalone' | 'espocrm' | 'dhis2' | 'generic' = 'standalone';
  
  // UI customization inputs
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';
  @Input() language: string = 'en';
  @Input() features: string[] = [];
  
  // Web component outputs for host system integration
  @Output() dashboardReady = new EventEmitter<boolean>();
  @Output() alertTriggered = new EventEmitter<any>();
  @Output() dataUpdated = new EventEmitter<any>();
  @Output() userAction = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  // Internal state
  isEmbedded = false;
  private loaderSubscription: Subscription;
  public loading = true; // Will be updated by LoaderService subscription
  private defaultLanguage = 'en';

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private platformDetectionService: PlatformDetectionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Initialize loader subscription but don't start it in constructor for web components
    console.log('🔄 AppComponent: Constructor initialized');
  }

  ngOnInit() {
    // Set up loader subscription first to avoid context issues
    this.loaderSubscription = this.loaderService
      .getLoaderSubscription()
      .subscribe((loading: boolean) => {
        console.log(`🔄 AppComponent: Loader state changed to: ${loading ? 'LOADING' : 'READY'}`);
        this.loading = loading;
        this.cdr.markForCheck();
      });
    
    // Force embedded mode detection for web components
    const isWebComponent = this.isRunningAsWebComponent();
    
    // Detect if running as web component and get actual platform
    const detectedPlatform = this.platformDetectionService.getPlatformMode();
    this.embedPlatform = this.embedPlatform !== 'standalone' ? this.embedPlatform : detectedPlatform;
    
    // Force embedded mode if running as web component
    if (isWebComponent && this.embedPlatform === 'standalone') {
      this.embedPlatform = 'generic';
      console.log('🔧 Force setting platform to generic for web component');
    }
    
    this.isEmbedded = this.embedPlatform !== 'standalone';
    
    // Set CSS mode for context-aware styling
    this.setCSSMode(isWebComponent);
    
    console.log(`🚀 IBF Dashboard initializing in ${this.embedPlatform} mode`);
    console.log(`🔍 Is embedded: ${this.isEmbedded}`);
    console.log(`🌐 Platform: ${this.embedPlatform}`);
    console.log(`🎯 Country: ${this.countryCode}`);
    console.log(`🔧 Is web component: ${isWebComponent}`);
    
    // Log platform detection info
    this.platformDetectionService.logPlatformInfo();
    
    // Add router debugging
    console.log('🧭 Current router URL:', window.location.href);
    console.log('🧭 Router state at init');
    
    if (this.isEmbedded) {
      console.log(`🔧 Configuring for embedded mode...`);
      this.configureForEmbedding();
      
      // Force navigation to dashboard in embedded mode
      console.log('🧭 Forcing navigation to /dashboard for embedded mode');
      console.log('🧭 Router available, navigating to /dashboard');
      this.router.navigate(['/dashboard']).then(success => {
        console.log('🧭 Navigation result:', success);
      }).catch(error => {
        console.error('🧭 Navigation failed:', error);
      });
    } else {
      this.configureForStandaloneMode();
    }
    
    this.initializeApp();
    
    // Add emergency loading state recovery
    setTimeout(() => {
      if (this.loading) {
        console.warn('⚠️ AppComponent: Loading state still active after 3 seconds - forcing to READY');
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }, 3000);
    
    setTimeout(() => {
      if (this.loading) {
        console.error('🚨 AppComponent: CRITICAL - Loading state stuck after 5 seconds - emergency override');
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }, 5000);
    
    // Emit ready event after initialization
    setTimeout(() => {
      this.dashboardReady.emit(true);
      console.log('✅ IBF Dashboard ready');
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    if (changes['language'] && this.language) {
      this.translateService.setDefaultLang(this.language);
      this.translateService.use(this.language);
    }
    
    if (changes['embedPlatform'] || changes['countryCode'] || changes['disasterType']) {
      // Re-configure if platform or core settings change
      console.log('🔄 App configuration changed, updating...');
      this.setCSSMode(this.isRunningAsWebComponent());
    }
    
    // Trigger change detection after handling input changes
    this.cdr.markForCheck();
  }

  initializeApp() {
    // Use provided language or default
    const lang = this.language || this.defaultLanguage;
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);
    this.platform.ready();
  }
  
  private configureForStandaloneMode() {
    console.log('🖥️ Configuring for standalone Azure web app mode');
    // Existing standalone behavior - no changes needed
  }
  
  private configureForEmbedding() {
    console.log(`🔗 Configuring for embedded mode in ${this.embedPlatform}`);
    
    // Apply platform-specific configurations
    switch (this.embedPlatform) {
      case 'espocrm':
        this.configureForEspoCRM();
        break;
      case 'dhis2':
        this.configureForDHIS2();
        break;
      case 'generic':
        this.configureForGeneric();
        break;
    }
    
    // Hide certain UI elements when embedded
    this.hideEmbeddedElements();
  }
  
  private configureForEspoCRM() {
    console.log('🏢 Configuring for EspoCRM integration');
    
    // EspoCRM-specific configuration
    if (this.authToken) {
      // Use provided EspoCRM authentication
      this.setupExternalAuth();
    }
    
    // Configure API endpoints for EspoCRM
    if (this.apiBaseUrl) {
      this.updateApiConfiguration();
    }
  }
  
  private configureForDHIS2() {
    console.log('🏥 Configuring for DHIS2 integration');
    // DHIS2-specific configuration
  }
  
  private configureForGeneric() {
    console.log('🌐 Configuring for generic embedding');
    // Generic embedding configuration
  }
  
  private hideEmbeddedElements() {
    // Hide login UI when embedded and authenticated externally
    if (this.authToken) {
      // Implementation to hide login interface
      document.body.classList.add('ibf-embedded-mode');
    }
  }
  
  private setupExternalAuth() {
    console.log('🔐 Setting up external authentication');
    // Configure authentication service to use external token
    // Implementation depends on your auth service
  }
  
  private updateApiConfiguration() {
    console.log('🔧 Updating API configuration for', this.apiBaseUrl);
    // Update API service configuration
    // Implementation depends on your API service
  }
  
  // Methods to emit events to host system
  public triggerAlert(alertData: any) {
    this.alertTriggered.emit(alertData);
  }
  
  public notifyDataUpdate(updateData: any) {
    this.dataUpdated.emit(updateData);
  }
  
  public logUserAction(action: string, context: any) {
    this.userAction.emit({ action, context, timestamp: new Date() });
  }
  
  // Helper method to detect if running as web component
  private isRunningAsWebComponent(): boolean {
    try {
      // Check if we're inside a custom element context
      const hostElement = document.querySelector('ibf-dashboard');
      const isCustomElement = !!hostElement && hostElement.tagName.toLowerCase() === 'ibf-dashboard';
      
      // Alternative: check if we're being executed from within a custom element
      const hasCustomElementAPI = 'customElements' in window;
      const isDefinedAsCustomElement = hasCustomElementAPI && customElements.get('ibf-dashboard');
      
      console.log('🔍 Web component detection:', {
        hostElement: !!hostElement,
        isCustomElement,
        hasCustomElementAPI,
        isDefinedAsCustomElement
      });
      
      return isCustomElement || !!isDefinedAsCustomElement;
    } catch (error) {
      console.debug('Web component detection error:', error);
      return false;
    }
  }
  
  // Set CSS mode for context-aware styling
  private setCSSMode(isWebComponent: boolean) {
    if (isWebComponent || this.isEmbedded) {
      // Set embedded mode
      document.documentElement.setAttribute('data-ibf-mode', 'embedded');
      document.documentElement.style.setProperty('--ibf-mode', 'embedded');
      
      // Set appropriate height for embedded mode
      const webComponent = document.querySelector('ibf-dashboard');
      if (webComponent) {
        const height = webComponent.getAttribute('height') || '600px';
        document.documentElement.style.setProperty('--ibf-app-height', height);
      } else {
        document.documentElement.style.setProperty('--ibf-app-height', '600px');
      }
      
      console.log('🎯 IBF Dashboard CSS mode set to EMBEDDED');
    } else {
      // Set standalone mode (default)
      document.documentElement.setAttribute('data-ibf-mode', 'standalone');
      document.documentElement.style.setProperty('--ibf-mode', 'standalone');
      document.documentElement.style.setProperty('--ibf-app-height', '100vh');
      
      console.log('🎯 IBF Dashboard CSS mode set to STANDALONE');
    }
  }
  
  public reportError(error: any) {
    this.error.emit(error);
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
