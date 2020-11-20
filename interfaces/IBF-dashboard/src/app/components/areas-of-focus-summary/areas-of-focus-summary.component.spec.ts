import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AreasOfFocusSummaryComponent } from './areas-of-focus-summary.component';

describe('AreasOfFocusSummaryComponent', () => {
  let component: AreasOfFocusSummaryComponent;
  let fixture: ComponentFixture<AreasOfFocusSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AreasOfFocusSummaryComponent],
      imports: [IonicModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AreasOfFocusSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
