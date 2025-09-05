import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { apps, chevronBackOutline } from 'ionicons/icons';
import { of } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CountryDisasterSettings } from 'src/app/models/country.model';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let countryService: jasmine.SpyObj<CountryService>;
  let disasterTypeService: jasmine.SpyObj<DisasterTypeService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'chevron-back-outline': chevronBackOutline, apps });

    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAuthSubscription',
    ]);

    authService.getAuthSubscription.and.returnValue(of(null));

    countryService = jasmine.createSpyObj<CountryService>('CountryService', [
      'getCountrySubscription',
    ]);

    countryService.getCountrySubscription.and.returnValue(of(null));

    disasterTypeService = jasmine.createSpyObj<DisasterTypeService>(
      'DisasterTypeService',
      ['getDisasterTypeSubscription', 'getCountryDisasterTypeSettings'],
    );

    disasterTypeService.getDisasterTypeSubscription.and.returnValue(of(null));

    disasterTypeService.getCountryDisasterTypeSettings.and.returnValue(
      {} as CountryDisasterSettings,
    );

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logPageView'],
    );

    analyticsService.logPageView.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [DashboardPage],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CountryService, useValue: countryService },
        { provide: DisasterTypeService, useValue: disasterTypeService },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
