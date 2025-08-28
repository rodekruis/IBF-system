import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { apps } from 'ionicons/icons';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LoginPage } from 'src/app/pages/login/login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(waitForAsync(() => {
    addIcons({ apps });

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logPageView'],
    );

    analyticsService.logPageView.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [LoginPage],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
