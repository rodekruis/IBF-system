import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { closeCircle, cloudDownload, cloudUpload } from 'ionicons/icons';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';

describe('LayerControlInfoPopoverComponent', () => {
  let component: LayerControlInfoPopoverComponent;
  let fixture: ComponentFixture<LayerControlInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({
      'close-circle': closeCircle,
      'cloud-download': cloudDownload,
      'cloud-upload': cloudUpload,
    });

    TestBed.configureTestingModule({
      declarations: [LayerControlInfoPopoverComponent],
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

    fixture = TestBed.createComponent(LayerControlInfoPopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
