import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { MapComponent } from 'src/app/components/map/map.component';
import { MapService } from 'src/app/services/map.service';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({
      'chevron-up-outline': chevronUpOutline,
      'chevron-down-outline': chevronDownOutline,
    });

    TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [
        IonicModule,
        LeafletModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MapService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
