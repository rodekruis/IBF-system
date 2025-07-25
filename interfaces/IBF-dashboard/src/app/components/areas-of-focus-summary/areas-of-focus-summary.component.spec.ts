import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AreasOfFocusSummaryComponent } from 'src/app/components/areas-of-focus-summary/areas-of-focus-summary.component';

describe('AreasOfFocusSummaryComponent', () => {
  let component: AreasOfFocusSummaryComponent;
  let fixture: ComponentFixture<AreasOfFocusSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AreasOfFocusSummaryComponent],
      imports: [IonicModule, RouterModule.forRoot([])],
      providers: [
        provideIonicAngular(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AreasOfFocusSummaryComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
