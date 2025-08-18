import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { MapService } from 'src/app/services/map.service';
import { SharedModule } from 'src/app/shared.module';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'chevron-back-outline': chevronBackOutline });

    TestBed.configureTestingModule({
      declarations: [DashboardPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule,
        SharedModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MapService },
        provideIonicAngular(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
