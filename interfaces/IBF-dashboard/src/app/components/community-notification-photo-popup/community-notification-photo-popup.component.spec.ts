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
import { closeCircle } from 'ionicons/icons';
import { CommunityNotificationPhotoPopupComponent } from 'src/app/components/community-notification-photo-popup/community-notification-photo-popup.component';

describe('CommunityNotificationPhotoPopupComponent', () => {
  let component: CommunityNotificationPhotoPopupComponent;
  let fixture: ComponentFixture<CommunityNotificationPhotoPopupComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'close-circle': closeCircle });

    TestBed.configureTestingModule({
      declarations: [CommunityNotificationPhotoPopupComponent],
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

    fixture = TestBed.createComponent(CommunityNotificationPhotoPopupComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
