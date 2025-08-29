import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  AlertController,
  IonicModule,
  PopoverController,
} from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { image } from 'ionicons/icons';
import { CommunityNotificationPopupComponent } from 'src/app/components/community-notification-popup/community-notification-popup.component';
import { ApiService } from 'src/app/services/api.service';

describe('CommunityNotificationPopupComponent', () => {
  let component: CommunityNotificationPopupComponent;
  let fixture: ComponentFixture<CommunityNotificationPopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let alertController: jasmine.SpyObj<AlertController>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(waitForAsync(() => {
    addIcons({ image });

    TestBed.configureTestingModule({
      declarations: [CommunityNotificationPopupComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: PopoverController, useValue: popoverController },
        { provide: AlertController, useValue: alertController },
        { provide: ApiService, useValue: apiService },
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
