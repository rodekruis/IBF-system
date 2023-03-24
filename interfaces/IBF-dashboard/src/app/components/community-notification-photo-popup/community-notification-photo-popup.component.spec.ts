import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { CommunityNotificationPhotoPopup } from './community-notification-photo-popup.component';

describe('CommunityNotificationPhotoPopup', () => {
  let component: CommunityNotificationPhotoPopup;
  let fixture: ComponentFixture<CommunityNotificationPhotoPopup>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CommunityNotificationPhotoPopup],
        imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(CommunityNotificationPhotoPopup);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
