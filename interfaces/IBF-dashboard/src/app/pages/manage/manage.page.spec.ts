import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { apps } from 'ionicons/icons';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ManagePage } from 'src/app/pages/manage/manage.page';

describe('ManagePage', () => {
  let component: ManagePage;
  let fixture: ComponentFixture<ManagePage>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(waitForAsync(() => {
    addIcons({ apps });

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logPageView'],
    );

    analyticsService.logPageView.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [ManagePage],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePage);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
