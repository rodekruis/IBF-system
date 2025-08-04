import { Component, OnDestroy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { PlatformDetectionService } from 'src/app/services/platform-detection.service';
import { EspoCrmAuthService } from 'src/app/services/espocrm-auth.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { AdminLevelService } from 'src/app/services/admin-level.service';
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
  @Input() defaultAdminLevel: number = 1;
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
  
  // Initialization tracking to prevent duplicate cycles
  private countryInitialized = false;
  private disasterTypeInitialized = false;
  private adminLevelInitialized = false;

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private platformDetectionService: PlatformDetectionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private espoCrmAuth: EspoCrmAuthService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private adminLevelService: AdminLevelService,
  ) {
    console.log('🔄 AppComponent: Constructor initialized');
  }

  ngOnInit() {
    // Set up loader subscription first to avoid context issues
    this.loaderSubscription = this.loaderService
      .getLoaderSubscription()
      .subscribe((loading: boolean) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });
    
    // Handle EspoCRM authentication if provided via input
    if (this.authToken) {
      console.log('🔐 Setting IBF token from input property');
      this.espoCrmAuth.setToken(this.authToken);
    }
    
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
    
    // Override platform if EspoCRM embedded mode is detected
    if (this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      this.embedPlatform = 'espocrm';
      console.log('🔧 EspoCRM embedded mode detected, setting platform to espocrm');
    }
    
    this.isEmbedded = this.embedPlatform !== 'standalone';
    
    // Set CSS mode for context-aware styling
    this.setCSSMode(isWebComponent);
    
    console.log(`🚀 IBF Dashboard initializing in ${this.embedPlatform} mode`);
    console.log(`🔍 Is embedded: ${this.isEmbedded}`);
    console.log(`🌐 Platform: ${this.embedPlatform}`);
    console.log(`🎯 Country: ${this.countryCode}`);
    console.log(`🔧 Is web component: ${isWebComponent}`);
    console.log(`🔐 EspoCRM auth available: ${this.espoCrmAuth.isAuthenticated()}`);
    
    // Set up EspoCRM authentication handling
    this.setupEspoCrmAuthentication();
    
    // COMMENTED OUT: Programmatic country selection - using user access settings instead
    // Set up programmatic country selection if embedded mode with country code
    // if (this.isEmbedded && this.countryCode && !this.countryInitialized) {
    //   console.log(`🎯 Setting programmatic country: ${this.countryCode} for embedded mode (initial)`);
    //   this.countryService.setProgrammaticCountry(this.countryCode);
    //   this.countryInitialized = true;
    // }
    
    // COMMENTED OUT: Programmatic disaster type selection - using user access settings instead
    // Set up programmatic disaster type selection if embedded mode with disaster type
    // if (this.isEmbedded && this.disasterType && !this.disasterTypeInitialized) {
    //   console.log(`🌪️ Setting programmatic disaster type: ${this.disasterType} for embedded mode (initial)`);
    //   this.setDisasterTypeFromCountry(this.disasterType);
    //   this.disasterTypeInitialized = true;
    // }
    
    // COMMENTED OUT: Programmatic admin level selection - using country defaults instead
    // Set up programmatic admin level if embedded mode with admin level
    // if (this.isEmbedded && this.defaultAdminLevel && !this.adminLevelInitialized) {
    //   console.log(`📊 Setting programmatic admin level: ${this.defaultAdminLevel} for embedded mode (initial)`);
    //   this.adminLevelService.setAdminLevel(this.defaultAdminLevel);
    //   this.adminLevelInitialized = true;
    // }
    
    // Log platform detection info
    this.platformDetectionService.logPlatformInfo();
    
    // Add router debugging
    console.log('🧭 Current router URL:', window.location.href);
    console.log('🧭 Router state at init');
    
    if (this.isEmbedded) {
      console.log(`🔧 Configuring for embedded mode...`);
      this.configureForEmbedding();
      
      // For embedded mode, let the custom LocationStrategy handle navigation
      console.log('🧭 Embedded mode - letting LocationStrategy handle navigation');
      // Don't force navigation here - let the router pick up the route from the URL
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
    // Defensive check to ensure we're in a valid context
    if (!changes || typeof changes !== 'object') {
      console.warn('⚠️ ngOnChanges called with invalid changes object:', changes);
      return;
    }

    try {
      // Handle input property changes for web component compatibility
      if (changes['language'] && this.language) {
        this.translateService.setDefaultLang(this.language);
        this.translateService.use(this.language);
        console.log('🌐 Language changed to:', this.language);
      }

      if (changes['authToken'] && this.authToken) {
        console.log('🔐 Auth token changed via input property');
        this.espoCrmAuth.setToken(this.authToken);
      }

      if (changes['embedPlatform'] && this.embedPlatform) {
        console.log('🌐 Platform changed to:', this.embedPlatform);
        this.isEmbedded = this.embedPlatform !== 'standalone';
      }
      
      // COMMENTED OUT: Programmatic country selection - using user access settings instead
      // if (changes['countryCode'] && this.countryCode && this.isEmbedded && !this.countryInitialized) {
      //   console.log(`🎯 Country code changed to: ${this.countryCode} (embedded mode)`);
      //   this.countryService.setProgrammaticCountry(this.countryCode);
      //   this.countryInitialized = true;
      // }
      
      // COMMENTED OUT: Programmatic disaster type selection - using user access settings instead
      // if (changes['disasterType'] && this.disasterType && this.isEmbedded && !this.disasterTypeInitialized) {
      //   console.log(`🌪️ Disaster type changed to: ${this.disasterType} (embedded mode)`);
      //   this.setDisasterTypeFromCountry(this.disasterType);
      //   this.disasterTypeInitialized = true;
      // }
      
      // COMMENTED OUT: Programmatic admin level selection - using country defaults instead
      // if (changes['defaultAdminLevel'] && this.defaultAdminLevel && this.isEmbedded && !this.adminLevelInitialized) {
      //   console.log(`📊 Default admin level changed to: ${this.defaultAdminLevel} (embedded mode)`);
      //   // Set the admin level programmatically if provided
      //   this.adminLevelService.setAdminLevel(this.defaultAdminLevel);
      //   this.adminLevelInitialized = true;
      // }
      
      if (changes['embedPlatform'] || changes['countryCode'] || changes['disasterType']) {
        // Re-configure if platform or core settings change
        console.log('🔄 App configuration changed, updating...');
        this.setCSSMode(this.isRunningAsWebComponent());
      }
      
      // Trigger change detection after handling input changes
      this.cdr.markForCheck();
    } catch (error) {
      console.error('🚨 Error in ngOnChanges:', error);
      // Continue execution even if there's an error
    }
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
    
    // Set up EspoCRM-compatible routing
    this.setupEspoCRMRouting();
  }
  
  private setupEspoCRMRouting() {
    console.log('🧭 Setting up EspoCRM-compatible routing with EmbeddedLocationStrategy');
    
    // The EmbeddedLocationStrategy handles URL management automatically
    // Navigate to empty string to avoid adding any route segments
    setTimeout(() => {
      this.router.navigate(['']).then(success => {
        if (success) {
          console.log('✅ Successfully navigated to root (empty) path via EmbeddedLocationStrategy');
          console.log('🔗 URL should be: https://ibf-pivot-crm-dev.510.global/#IBFDashboard');
        } else {
          console.warn('⚠️ Navigation to empty path failed');
        }
      }).catch(error => {
        console.error('❌ Error navigating to empty path:', error);
      });
    }, 100); // Small delay to ensure LocationStrategy is fully initialized
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

  private setDisasterTypeFromCountry(disasterTypeKey: string): void {
    console.log(`🌪️ Setting disaster type: ${disasterTypeKey}`);
    
    let isCompleted = false; // Track if the operation completed successfully
    
    // Wait for country to be loaded, then select the disaster type from available types
    const subscription = this.countryService.getCountrySubscription().subscribe(country => {
      if (country?.disasterTypes && country.disasterTypes.length > 0) {
        const availableDisasterType = country.disasterTypes.find(
          dt => dt.disasterType === disasterTypeKey
        );
        if (availableDisasterType) {
          console.log(`✅ Found disaster type ${disasterTypeKey} in country data, setting it`);
          this.disasterTypeService.setDisasterType(availableDisasterType);
          isCompleted = true; // Mark as completed
          subscription.unsubscribe(); // Unsubscribe after successful match
        } else {
          console.warn(`⚠️ Disaster type ${disasterTypeKey} not found in country ${country.countryCodeISO3} available types:`, 
                      country.disasterTypes.map(dt => dt.disasterType));
          
          // Try to set a fallback disaster type if the requested one is not available
          console.log(`🔄 Setting fallback disaster type: ${country.disasterTypes[0].disasterType}`);
          this.disasterTypeService.setDisasterType(country.disasterTypes[0]);
          isCompleted = true; // Mark as completed
          subscription.unsubscribe(); // Unsubscribe after unsuccessful match
        }
      } else if (country) {
        // Country loaded but no disaster types yet - wait a bit more
        console.log(`⏳ Country ${country.countryCodeISO3} loaded but disaster types not yet available, waiting...`);
      }
    });
    
    // Add timeout to prevent infinite waiting - only warn if not yet completed
    setTimeout(() => {
      if (!isCompleted) {
        subscription.unsubscribe();
        console.warn(`⚠️ Timeout waiting for disaster type ${disasterTypeKey} to be set - this may be normal for embedded mode`);
      } else {
        console.log(`✅ Disaster type ${disasterTypeKey} was set successfully, timeout cleared`);
      }
    }, 15000);
  }

  private setupEspoCrmAuthentication(): void {
    if (this.embedPlatform !== 'espocrm') {
      return;
    }

    console.log('🔐 Setting up EspoCRM backend authentication...');

    // Subscribe to authentication state changes
    this.espoCrmAuth.isAuthenticated$.subscribe(isAuthenticated => {
      console.log('🔐 IBF backend authentication state changed:', isAuthenticated);
      
      if (isAuthenticated && this.espoCrmAuth.getToken()) {
        // Authentication successful - proceed to dashboard
        if (this.router.url === '/login' || this.router.url === '/') {
          console.log('🔐 IBF backend authenticated, navigating to dashboard');
          this.router.navigate(['/dashboard']).catch(err => {
            console.error('🔐 Navigation to dashboard failed:', err);
          });
        }
      }
    });

    // Check if already authenticated with IBF backend token
    if (this.espoCrmAuth.isAuthenticated()) {
      console.log('🔐 Already authenticated with IBF backend, skipping login');
      
      // Skip login screen if we're on login route
      if (this.router.url === '/login' || this.router.url === '/') {
        this.router.navigate(['/dashboard']).catch(err => {
          console.error('🔐 Navigation to dashboard failed:', err);
        });
      }
    }
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }
}
