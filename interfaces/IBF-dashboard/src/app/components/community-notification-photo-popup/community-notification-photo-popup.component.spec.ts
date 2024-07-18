import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommunityNotificationPhotoPopupComponent } from './community-notification-photo-popup.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('CommunityNotificationPhotoPopupComponent', () => {
  let component: CommunityNotificationPhotoPopupComponent;
  let fixture: ComponentFixture<CommunityNotificationPhotoPopupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CommunityNotificationPhotoPopupComponent],
        imports: [IonicModule, RouterTestingModule, TranslateModule.forRoot()],
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(
        CommunityNotificationPhotoPopupComponent,
      );
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
