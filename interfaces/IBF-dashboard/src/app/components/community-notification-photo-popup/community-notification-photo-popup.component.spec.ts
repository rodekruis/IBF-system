import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { CommunityNotificationPhotoPopupComponent } from './community-notification-photo-popup.component';

describe('CommunityNotificationPhotoPopupComponent', () => {
  let component: CommunityNotificationPhotoPopupComponent;
  let fixture: ComponentFixture<CommunityNotificationPhotoPopupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CommunityNotificationPhotoPopupComponent],
        imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
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
