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
import { image } from 'ionicons/icons';
import { CommunityNotificationPopupComponent } from 'src/app/components/community-notification-popup/community-notification-popup.component';

describe('CommunityNotificationPopupComponent', () => {
  let component: CommunityNotificationPopupComponent;
  let fixture: ComponentFixture<CommunityNotificationPopupComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({ image });

    TestBed.configureTestingModule({
      declarations: [CommunityNotificationPopupComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        provideIonicAngular(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityNotificationPopupComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
