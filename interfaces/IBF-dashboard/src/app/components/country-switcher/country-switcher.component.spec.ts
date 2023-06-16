import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { StoreModule } from '@ngrx/store';
import { CountryService } from 'src/app/services/country.service';
import { reducers } from '../../store/index';
import { CountrySwitcherComponent } from './country-switcher.component';

describe('CountrySwitcherComponent', () => {
  let component: CountrySwitcherComponent;
  let fixture: ComponentFixture<CountrySwitcherComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CountrySwitcherComponent],
        imports: [
          IonicModule,
          HttpClientTestingModule,
          RouterTestingModule,
          StoreModule.forRoot(reducers),
        ],
        providers: [{ provide: CountryService }],
      }).compileComponents();

      fixture = TestBed.createComponent(CountrySwitcherComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
