import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiverGaugePopupContentComponent } from './river-gauge-popup-content.component';

describe('DynamicPointPopupComponent', () => {
  let component: RiverGaugePopupContentComponent;
  let fixture: ComponentFixture<RiverGaugePopupContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiverGaugePopupContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiverGaugePopupContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
