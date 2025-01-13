import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CountrySwitcherComponent } from 'src/app/components/country-switcher/country-switcher.component';
import { CountryService } from 'src/app/services/country.service';

describe('CountrySwitcherComponent', () => {
  let component: CountrySwitcherComponent;
  let fixture: ComponentFixture<CountrySwitcherComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule,
        RouterModule.forRoot([]),
        CountrySwitcherComponent,
      ],
      providers: [
        { provide: CountryService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CountrySwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
