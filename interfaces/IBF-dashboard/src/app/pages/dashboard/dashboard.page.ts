import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';
import { User } from 'src/app/models/user/user.model';
import { Country } from 'src/app/models/country.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { environment } from 'src/environments/environment';
import { DebugService } from 'src/app/services/debug.service';
import { EspoCrmAuthService } from 'src/app/services/espocrm-auth.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { PlatformDetectionService } from 'src/app/services/platform-detection.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AssetUrlService } from 'src/app/services/asset-url.service';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  public version: string = environment.ibfSystemVersion;
  public isDev = false;
  public isMultiCountry = false;
  public templateRendered = false; // Add explicit template state tracking
  public currentCountry: Country = null; // Add current country information
  public isCountryDropdownOpen = false; // Add country dropdown state tracking
  public isMenuPanelOpen = false; // Add menu panel state tracking
  
  private readonly adminRole = UserRole.Admin;
  public environmentConfiguration = environment.configuration;
  private authSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private static instanceCount = 0;
  private instanceId: number;
  
  // Cache the header visibility state to avoid repeated calculations
  private _shouldHideHeader: boolean | null = null;

  /**
   * Determines if the header should be hidden (for EspoCRM embedding)
   * Cached to avoid performance issues during change detection
   */
  get shouldHideHeader(): boolean {
    if (this._shouldHideHeader === null) {
      const isPlatformEspocrm = this.platformDetectionService.isEspoCrmMode();
      const isDomEspocrm = this.espoCrmAuth.isEmbeddedInEspoCrm();
      this._shouldHideHeader = isPlatformEspocrm || isDomEspocrm;
      
      // Log only once when first calculated
      console.log('🎭 shouldHideHeader calculated:', {
        isPlatformEspocrm,
        isDomEspocrm,
        result: this._shouldHideHeader,
        timestamp: new Date().toISOString()
      });
    }
    
    return this._shouldHideHeader;
  }

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private popoverController: PopoverController,
    private debugService: DebugService,
    private cdr: ChangeDetectorRef, // Add ChangeDetectorRef for manual change detection
    private espoCrmAuth: EspoCrmAuthService,
    private countryService: CountryService,
    private eventService: EventService,
    private aggregatesService: AggregatesService,
    private disasterTypeService: DisasterTypeService,
    private platformDetectionService: PlatformDetectionService,
    private placeCodeService: PlaceCodeService,
    private assetUrlService: AssetUrlService,
  ) {
    // Track multiple instances
    DashboardPage.instanceCount++;
    this.instanceId = DashboardPage.instanceCount;
    
    this.debugService.logComponentInit('DashboardPage', `Constructor called - Instance #${this.instanceId}`);
    
    // Warn if multiple instances are being created
    if (DashboardPage.instanceCount > 1) {
      console.error(`🚨 CRITICAL: Multiple DashboardPage instances created! Current count: ${DashboardPage.instanceCount}`);
      console.error('🚨 This indicates a routing or component lifecycle issue');
    }

    // Add navigation tracking
    console.log('🧭 DashboardPage: Constructor - Current URL:', window.location.href);
    console.log('🧭 DashboardPage: Constructor - Timestamp:', new Date().toISOString());

    if (!this.isPhone() && !this.isTablet()) {
      return;
    }

    if (this.isTablet() && screen.orientation.type.includes('landscape')) {
      return;
    }

    this.showScreenOrientationPopover();
  }

  ngOnInit() {
    // Set up auth subscription in ngOnInit to avoid change detection issues during constructor
    this.authSubscription = this.authService.getAuthSubscription().subscribe(this.onUserChange);
    
    // Set up country subscription to track current country
    this.countrySubscription = this.countryService.getCountrySubscription().subscribe((country: Country) => {
      this.currentCountry = country;
      this.cdr.markForCheck();
      console.log('🎯 DashboardPage: Country updated:', country?.countryName);
      
      // Add data loading debugging when country changes
      if (country) {
        console.log('📊 Data loading check for country:', country.countryCodeISO3);
        this.debugDataState();
      }
    });
    
    // Set up disaster type subscription to track changes
    this.disasterTypeSubscription = this.disasterTypeService.getDisasterTypeSubscription().subscribe((disasterType) => {
      console.log('🌪️ DashboardPage: Disaster type updated:', disasterType?.disasterType);
      this.cdr.markForCheck();
    });
    
    // Add data loading debugging subscriptions
    this.eventService.getInitialEventStateSubscription().subscribe((eventState) => {
      console.log('📊 DashboardPage: Event state:', eventState ? 'loaded' : 'empty');
    });
    
    this.aggregatesService.getIndicators().subscribe((indicators) => {
      console.log('📊 DashboardPage: Indicators data:', indicators ? indicators.length + ' indicators' : 'empty');
    });
    
    this.debugService.logComponentInit('DashboardPage', {
      isDev: this.isDev,
      isMultiCountry: this.isMultiCountry,
      version: this.version
    });
    
    // Schedule initial template rendering with proper timing
    setTimeout(() => {
      this.templateRendered = true;
      this.cdr.markForCheck(); // Use markForCheck instead of detectChanges
      console.log('🔄 DashboardPage: Initial template rendering scheduled');
    }, 0);
    this.analyticsService.logPageView(AnalyticsPage.dashboard);
    
    // Mark for check after component initialization instead of forcing detection
    this.cdr.markForCheck();
    
    // Add immediate DOM check
    console.log('🔍 DashboardPage ngOnInit - DOM check immediately:');
    console.log('🔍 Dashboard element exists:', !!document.querySelector('[data-testid="ibf-dashboard-interface"]'));
    console.log('🔍 App root exists:', !!document.querySelector('#app'));
    console.log('🔍 Router outlet exists:', !!document.querySelector('router-outlet'));
    console.log('🔍 Total DOM elements:', document.querySelectorAll('*').length);
    
    // Check DOM state after a short delay
    setTimeout(() => {
      this.debugService.logDOMState();
      this.cdr.markForCheck(); // Use markForCheck instead of detectChanges
    }, 100);
    
    // Schedule multiple change detection cycles to ensure template renders
    setTimeout(() => {
      this.cdr.markForCheck();
      console.log('🔄 DashboardPage: Additional change detection at 250ms');
    }, 250);
    
    setTimeout(() => {
      this.cdr.markForCheck();
      console.log('🔄 DashboardPage: Additional change detection at 500ms');
      this.debugService.logDOMState();
    }, 500);
  }

  ngAfterViewInit() {
    this.debugService.logComponentAfterViewInit('DashboardPage');
    
    // Mark for check in AfterViewInit instead of forcing detection
    this.cdr.markForCheck();
    
    // Check DOM state again after view init
    setTimeout(() => {
      this.debugService.logDOMState();
      this.debugService.logCSSStyles('DashboardPage', '.ibf-dashboard-left-column');
      this.debugService.logCSSStyles('DashboardPage', '.ibf-dashboard-right-column');
      this.debugService.logCSSStyles('DashboardPage', 'app-chat');
      this.debugService.logCSSStyles('DashboardPage', 'app-map');
      this.cdr.markForCheck(); // Use markForCheck after checks
    }, 500);
    
    // Check again after longer delay with more conservative change detection
    setTimeout(() => {
      this.cdr.markForCheck(); // Mark component and ancestors for check
      this.debugService.logDOMState();
      
      // If DOM still empty, try to diagnose template issues
      const dashboardElement = document.querySelector('[data-testid="ibf-dashboard-interface"]');
      if (!dashboardElement) {
        console.error('🚨 CRITICAL: Dashboard template still not rendered after 2 seconds');
        console.error('🚨 Component state:', {
          isDev: this.isDev,
          isMultiCountry: this.isMultiCountry,
          templateRendered: this.templateRendered,
          version: this.version
        });
        
        // Try one more conservative change detection
        this.templateRendered = true;
        this.cdr.markForCheck();
        
        setTimeout(() => {
          this.debugService.logDOMState();
          console.log('🔄 Final change detection attempt complete');
        }, 100);
      }
    }, 2000);
  }

  ngOnDestroy() {
    // Track instance destruction
    DashboardPage.instanceCount--;
    console.log(`💀 DashboardPage: Instance #${this.instanceId} destroyed. Remaining: ${DashboardPage.instanceCount}`);
    
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
    
    if (this.disasterTypeSubscription) {
      this.disasterTypeSubscription.unsubscribe();
    }
  }

  private onUserChange = (user: User): void => {
    if (user) {
      this.isDev = user.userRole === this.adminRole;
      this.isMultiCountry = user.countries.length > 1;
      
      // Mark for check instead of forcing immediate detection to avoid assertion errors
      this.cdr.markForCheck();
      console.log('🔄 DashboardPage: Component marked for check by user change', {
        isDev: this.isDev,
        isMultiCountry: this.isMultiCountry
      });
    }
  };

  /**
   * Debug current data state for troubleshooting empty containers
   */
  private debugDataState(): void {
    console.log('🔍 DashboardPage - Data State Debug:');
    console.log('🔍 Indicators:', this.aggregatesService.indicators?.length || 0);
    console.log('🔍 Alert Areas:', this.aggregatesService.alertAreas?.length || 0);
    console.log('🔍 Current Country:', this.currentCountry?.countryName || 'none');
    console.log('🔍 Template Rendered:', this.templateRendered);
    
    // Check DOM elements
    setTimeout(() => {
      console.log('🔍 DOM Check:');
      console.log('🔍 aggregate-list elements:', document.querySelectorAll('app-aggregate-list').length);
      console.log('🔍 areas-of-focus-summary elements:', document.querySelectorAll('app-areas-of-focus-summary').length);
      console.log('🔍 matrix elements:', document.querySelectorAll('app-matrix').length);
    }, 100);
  }

  private isTablet(): boolean {
    return /ipad|tablet|android(?!.*mobile)|windows(?!.*phone).*touch|kindle|playbook|silk|puffin(?!.*(?:IP|AP|WP))/.test(
      navigator.userAgent.toLowerCase(),
    );
  }

  private isPhone(): boolean {
    return /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(?:hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(?:ob|in)i|palm(?: os)?|phone|p(?:ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(?:browser|link)|vodafone|wap|windows (?:ce|phone)|xda|xiino/i.test(
      navigator.userAgent.toLowerCase(),
    );
  }

  private async showScreenOrientationPopover() {
    const popover = await this.popoverController.create({
      component: ScreenOrientationPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ${this.isTablet() ? 'ibf-popover-normal' : ''}`,
      translucent: true,
      showBackdrop: true,
      componentProps: { device: this.isPhone() ? 'mobile' : 'tablet' },
    });

    await popover.present();
  }

  public getTodayDate(): Date {
    return DateTime.now().toJSDate();
  }

  public countryDropdownToggled(isOpen: boolean): void {
    this.isCountryDropdownOpen = isOpen;
    this.cdr.markForCheck();
  }

  // Methods required by the template

  /**
   * Get the active disaster type icon
   */
  getActiveDisasterTypeIcon(): string {
    const disasterType = this.disasterTypeService.disasterType;
    if (disasterType?.disasterType && DISASTER_TYPES_SVG_MAP[disasterType.disasterType]) {
      const buttonStatus = `selectedNonTriggered`; // Default to non-triggered
      const assetPath = DISASTER_TYPES_SVG_MAP[disasterType.disasterType][buttonStatus];
      return this.assetUrlService.getAssetUrl(assetPath);
    }
    // Default icon if no disaster type is selected
    return this.assetUrlService.getAssetUrl('assets/icons/disaster-types/default.svg');
  }

  /**
   * Get the current disaster type name
   */
  getCurrentDisasterTypeName(): string {
    const disasterType = this.disasterTypeService.disasterType;
    return disasterType?.label || 'No disaster type';
  }

  /**
   * Check if the current disaster type is triggered
   */
  isTriggered(): boolean {
    // Check if there are any triggered events for the current disaster type
    const eventState = this.eventService.state;
    return eventState?.events?.some(event => event.firstTriggerLeadTime) || false;
  }

  /**
   * Get the triggered state text
   */
  getTriggeredStateText(): string {
    return this.isTriggered() ? 'TRIGGERED' : 'NO TRIGGER';
  }

  /**
   * Check if admin panel should be shown
   */
  shouldShowAdminPanel(): boolean {
    // Admin panel is shown in standard layout when there's a selected admin area
    return !this.shouldHideHeader && this.hasSelectedAdminArea();
  }

  /**
   * Close the admin panel
   */
  closeAdminPanel(): void {
    // Clear the selected place code to hide the admin panel
    this.placeCodeService.clearPlaceCode();
    this.cdr.markForCheck();
  }

  /**
   * Toggle the menu panel
   */
  toggleMenuPanel(): void {
    this.isMenuPanelOpen = !this.isMenuPanelOpen;
    this.cdr.markForCheck();
  }

  /**
   * Close the menu panel
   */
  closeMenuPanel(): void {
    this.isMenuPanelOpen = false;
    this.cdr.markForCheck();
  }

  /**
   * Handle map area click
   */
  onMapAreaClick(event: Event): void {
    // Close menu panel if clicking outside menu content
    if (this.isMenuPanelOpen && !(event.target as Element).closest('.menu-panel-content')) {
      this.closeMenuPanel();
    }
  }

  /**
   * Check if there's a selected admin area
   */
  hasSelectedAdminArea(): boolean {
    // Check if there's a selected place code and indicators available
    let hasSelectedPlace = false;
    this.placeCodeService.getPlaceCodeSubscription().subscribe(placeCode => {
      hasSelectedPlace = !!placeCode;
    }).unsubscribe();
    
    const hasIndicators = this.aggregatesService.indicators && this.aggregatesService.indicators.length > 0;
    
    return hasSelectedPlace && hasIndicators;
  }

  /**
   * Logout function
   */
  logout(): void {
    this.authService.logout();
  }
}
