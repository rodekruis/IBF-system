import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  IonicModule,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { closeCircle, cloudDownload, cloudUpload } from 'ionicons/icons';
import { of } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { ApiService } from 'src/app/services/api.service';

describe('LayerControlInfoPopoverComponent', () => {
  let component: LayerControlInfoPopoverComponent;
  let fixture: ComponentFixture<LayerControlInfoPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let toastController: jasmine.SpyObj<ToastController>;
  let apiService: jasmine.SpyObj<ApiService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(waitForAsync(() => {
    addIcons({
      'close-circle': closeCircle,
      'cloud-download': cloudDownload,
      'cloud-upload': cloudUpload,
    });

    popoverController = jasmine.createSpyObj<PopoverController>(
      'PopoverController',
      ['dismiss'],
    );

    toastController = jasmine.createSpyObj<ToastController>('ToastController', [
      'create',
    ]);

    apiService = jasmine.createSpyObj<ApiService>('ApiService', [
      'getPointData',
      'postPointData',
    ]);

    apiService.getPointData.and.returnValue(of(null));

    apiService.postPointData.and.returnValue(of(null));

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logEvent'],
    );

    TestBed.configureTestingModule({
      declarations: [LayerControlInfoPopoverComponent],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: PopoverController, useValue: popoverController },
        { provide: ToastController, useValue: toastController },
        { provide: ApiService, useValue: apiService },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerControlInfoPopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
