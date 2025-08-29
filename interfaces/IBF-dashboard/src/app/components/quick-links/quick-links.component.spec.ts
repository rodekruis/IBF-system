import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { QuickLinksComponent } from 'src/app/components/quick-links/quick-links.component';

describe('QuickLinksComponent', () => {
  let component: QuickLinksComponent;
  let fixture: ComponentFixture<QuickLinksComponent>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logEvent'],
    );

    await TestBed.configureTestingModule({
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickLinksComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
