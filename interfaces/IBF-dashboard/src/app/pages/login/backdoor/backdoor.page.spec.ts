import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { apps } from 'ionicons/icons';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { BackdoorPage } from 'src/app/pages/login/backdoor/backdoor.page';

describe('BackdoorPage', () => {
  let component: BackdoorPage;
  let fixture: ComponentFixture<BackdoorPage>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(waitForAsync(() => {
    addIcons({ apps });

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logPageView'],
    );

    analyticsService.logPageView.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [BackdoorPage],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BackdoorPage);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
