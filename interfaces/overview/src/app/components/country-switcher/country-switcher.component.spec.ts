import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { CountryService } from 'src/app/services/country.service';
import { CountrySwitcherComponent } from './country-switcher.component';

describe('CountrySwitcherComponent', () => {
  let component: CountrySwitcherComponent;
  let fixture: ComponentFixture<CountrySwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountrySwitcherComponent],
      imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: CountryService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CountrySwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
