import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { environment } from 'src/environments/environment';
import { DebugService } from 'src/app/services/debug.service';

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
  private readonly adminRole = UserRole.Admin;
  public environmentConfiguration = environment.configuration;
  private authSubscription: Subscription;
  private static instanceCount = 0;
  private instanceId: number;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private popoverController: PopoverController,
    private debugService: DebugService,
    private cdr: ChangeDetectorRef, // Add ChangeDetectorRef for manual change detection
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
}
