import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { Country } from 'src/app/models/country.model';
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
  public templateRendered = false;
  public currentCountry: Country | null = null;
  public isCountryDropdownOpen = false;
  public isMenuPanelOpen = false;
  public isAdminPanelExpanded = false;

  private readonly adminRole = UserRole.Admin;
  public environmentConfiguration = environment.configuration;
  private authSubscription?: Subscription;
  private countrySubscription?: Subscription;
  private disasterTypeSubscription?: Subscription;
  private static instanceCount = 0;
  private instanceId!: number;
  private isInitialized = false;
  private isDestroyed = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private popoverController: PopoverController,
    private debugService: DebugService,
    private cdr: ChangeDetectorRef,
    private espoCrmAuth: EspoCrmAuthService,
    private countryService: CountryService,
    private eventService: EventService,
    private aggregatesService: AggregatesService,
    private disasterTypeService: DisasterTypeService,
    private platformDetectionService: PlatformDetectionService,
    private placeCodeService: PlaceCodeService,
    private assetUrlService: AssetUrlService,
  ) {
    DashboardPage.instanceCount++;
    this.instanceId = DashboardPage.instanceCount;

    this.debugService.logComponentInit('DashboardPage', this.instanceId);

    if (DashboardPage.instanceCount > 1) {
      console.error(
        `🚨 CRITICAL: Multiple DashboardPage instances created! Current count: ${DashboardPage.instanceCount}`,
      );
      console.error('🚨 This indicates a routing or component lifecycle issue');
    }

    console.log(
      '🧭 DashboardPage: Constructor - Current URL:',
      window.location.href,
    );
    console.log(
      '🧭 DashboardPage: Constructor - Timestamp:',
      new Date().toISOString(),
    );

    if (!this.isPhone() && !this.isTablet()) {
      return;
    }

    if (this.isTablet() && screen.orientation.type.includes('landscape')) {
      return;
    }

    this.showScreenOrientationPopover();
  }

  ngOnInit() {
    if (this.isInitialized || this.isDestroyed) {
      console.warn(
        `⚠️ DashboardPage[${this.instanceId}]: Preventing duplicate initialization`,
        { isInitialized: this.isInitialized, isDestroyed: this.isDestroyed },
      );
      return;
    }

    this.debugService.logComponentInit('DashboardPage', this.instanceId);

    try {
      this.initializeServices();
      this.isInitialized = true;
      this.analyticsService.logPageView(AnalyticsPage.dashboard);
    } catch (error) {
      console.error(
        `❌ DashboardPage[${this.instanceId}]: Initialization failed`,
        error,
      );
      this.cleanup();
    }
  }

  ngAfterViewInit() {
    this.debugService.logComponentAfterViewInit('DashboardPage');
    this.cdr.markForCheck();

    setTimeout(() => {
      this.debugService.logDOMState();
      this.debugService.logCSSStyles(
        'DashboardPage',
        '.ibf-dashboard-left-column',
      );
      this.debugService.logCSSStyles(
        'DashboardPage',
        '.ibf-dashboard-right-column',
      );
      this.debugService.logCSSStyles('DashboardPage', 'app-chat');
      this.debugService.logCSSStyles('DashboardPage', 'app-map');
      this.cdr.markForCheck();
    }, 500);

    setTimeout(() => {
      this.cdr.markForCheck();
      this.debugService.logDOMState();

      const dashboardElement = document.querySelector(
        '[data-testid="ibf-dashboard-interface"]',
      );
      if (!dashboardElement) {
        console.error(
          '🚨 CRITICAL: Dashboard template still not rendered after 2 seconds',
        );
        console.error('🚨 Component state:', {
          isDev: this.isDev,
          isMultiCountry: this.isMultiCountry,
          templateRendered: this.templateRendered,
          version: this.version,
        });

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
    this.cleanup();
  }

  private initializeServices() {
    this.authSubscription = this.authService
      .getAuthSubscription()
      .pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(100))
      .subscribe({
        next: this.onUserChange.bind(this),
        error: (error) => console.error('Auth subscription error:', error),
      });

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(
          (prev, curr) => prev?.countryCodeISO3 === curr?.countryCodeISO3,
        ),
        debounceTime(100),
      )
      .subscribe({
        next: (country: Country) => {
          if (!this.isDestroyed) {
            this.currentCountry = country;
            this.cdr.markForCheck();
            console.log(
              '🎯 DashboardPage: Country updated:',
              country?.countryName,
            );
          }
        },
        error: (error) => console.error('Country subscription error:', error),
      });

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(100))
      .subscribe({
        next: (disasterType) => {
          if (!this.isDestroyed) {
            console.log(
              '🌪️ DashboardPage: Disaster type updated:',
              disasterType?.disasterType,
            );
            this.cdr.markForCheck();
          }
        },
        error: (error) =>
          console.error('Disaster type subscription error:', error),
      });

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.templateRendered = true;
        this.cdr.markForCheck();
        console.log('🔄 DashboardPage: Initial template rendering scheduled');
      }
    }, 0);
  }

  private cleanup() {
    this.isDestroyed = true;

    this.destroy$.next();
    this.destroy$.complete();

    DashboardPage.instanceCount = Math.max(0, DashboardPage.instanceCount - 1);
    console.log(
      `💀 DashboardPage: Instance #${this.instanceId} destroyed. Remaining: ${DashboardPage.instanceCount}`,
    );

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = undefined;
    }

    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
      this.countrySubscription = undefined;
    }

    if (this.disasterTypeSubscription) {
      this.disasterTypeSubscription.unsubscribe();
      this.disasterTypeSubscription = undefined;
    }
  }

  private onUserChange(user: User): void {
    if (user) {
      this.isDev = user.userRole === this.adminRole;
      this.isMultiCountry = user.countries.length > 1;
      this.cdr.markForCheck();
      console.log(
        '🔄 DashboardPage: Component marked for check by user change',
        { isDev: this.isDev, isMultiCountry: this.isMultiCountry },
      );
    }
  }

  private debugDataState(): void {
    console.log('🔍 DashboardPage - Data State Debug:');
    console.log(
      '🔍 Indicators:',
      this.aggregatesService.indicators?.length || 0,
    );
    console.log(
      '🔍 Alert Areas:',
      this.aggregatesService.alertAreas?.length || 0,
    );
    console.log(
      '🔍 Current Country:',
      this.currentCountry?.countryName || 'none',
    );
    console.log('🔍 Template Rendered:', this.templateRendered);

    setTimeout(() => {
      console.log('🔍 DOM Check:');
      console.log(
        '🔍 aggregate-list elements:',
        document.querySelectorAll('app-aggregate-list').length,
      );
      console.log(
        '🔍 areas-of-focus-summary elements:',
        document.querySelectorAll('app-areas-of-focus-summary').length,
      );
      console.log(
        '🔍 matrix elements:',
        document.querySelectorAll('app-matrix').length,
      );
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

  getActiveDisasterTypeIcon(): string {
    const disasterType = this.disasterTypeService.disasterType;
    if (
      disasterType?.disasterType &&
      DISASTER_TYPES_SVG_MAP[disasterType.disasterType]
    ) {
      const buttonStatus = `selectedNonTriggered`;
      const assetPath =
        DISASTER_TYPES_SVG_MAP[disasterType.disasterType][buttonStatus];
      return this.assetUrlService.getAssetUrl(assetPath);
    }
    return this.assetUrlService.getAssetUrl(
      'assets/icons/disaster-types/default.svg',
    );
  }

  getCurrentDisasterTypeName(): string {
    const disasterType = this.disasterTypeService.disasterType;
    return disasterType?.label || 'No disaster type';
  }

  isTriggered(): boolean {
    const eventState = this.eventService.state;
    return (
      eventState?.events?.some((event) => event.firstTriggerLeadTime) || false
    );
  }

  getTriggeredStateText(): string {
    return this.isTriggered() ? 'TRIGGERED' : 'NO TRIGGER';
  }

  shouldShowAdminPanel(): boolean {
    return this.hasSelectedAdminArea();
  }

  closeAdminPanel(): void {
    this.placeCodeService.clearPlaceCode();
    this.cdr.markForCheck();
  }

  toggleMenuPanel(): void {
    this.isMenuPanelOpen = !this.isMenuPanelOpen;
    this.cdr.markForCheck();
  }

  toggleAdminPanel(): void {
    if (this.isAdminPanelExpanded) {
      // When closing, also clear any selected place codes
      this.closeAdminPanel();
    }
    this.isAdminPanelExpanded = !this.isAdminPanelExpanded;
    this.cdr.markForCheck();
  }

  closeMenuPanel(): void {
    this.isMenuPanelOpen = false;
    this.cdr.markForCheck();
  }

  onBackgroundClick(event: Event): void {
    if (
      this.isMenuPanelOpen &&
      !(event.target as Element).closest('.menu-panel-content') &&
      !(event.target as Element).closest('.menu-button')
    ) {
      this.closeMenuPanel();
    }
  }

  onMapAreaClick(): void {
    // This method is no longer used as we moved click handling to background
    // Keeping for potential future use
  }

  hasSelectedAdminArea(): boolean {
    if (this.isMenuPanelOpen) {
      return false;
    }

    let hasSelectedPlace = false;
    try {
      this.placeCodeService
        .getPlaceCodeSubscription()
        .subscribe((placeCode) => {
          hasSelectedPlace = !!placeCode;
          if (hasSelectedPlace) {
            this.isAdminPanelExpanded = true;
          }
        })
        .unsubscribe();
    } catch {
      hasSelectedPlace = false;
    }

    const hasIndicators =
      this.aggregatesService.indicators &&
      this.aggregatesService.indicators.length > 0;

    return hasSelectedPlace && hasIndicators;
  }

  /**
   * Generate EspoCRM EarlyWarning URL with client-side filters for countryCodeISO3 and disasterType
   */
  public generateEarlyWarningUrl(): string {
    // Get the base URL from the current window location
    // This allows the component to work in any EspoCRM instance
    const baseUrl = `${window.location.protocol}//${window.location.host}`;

    // Get current country and disaster type from services
    const countryCodeISO3 = this.currentCountry?.countryCodeISO3 || 'ETH';
    const disasterType =
      this.disasterTypeService.disasterType?.disasterType || 'drought';

    // Create URL parameters for client-side filtering
    // These will be processed by our custom EarlyWarning list view
    const params = new URLSearchParams({
      countryCodeISO3: countryCodeISO3,
      disasterType: disasterType,
    });

    // Return URL to EspoCRM web interface with filter parameters
    // Our custom list view will read these parameters and apply filters client-side
    return `${baseUrl}/#EarlyWarning?${params.toString()}`;
  }

  /**
   * Open EarlyWarning in EspoCRM interface in a new tab
   */
  public openEarlyWarning(): void {
    const url = this.generateEarlyWarningUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  logout(): void {
    this.authService.logout();
  }
}
