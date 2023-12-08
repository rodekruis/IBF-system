import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThresholdBarComponent } from './threshold-bar.component';

describe('ThresholdBarComponent', () => {
  let component: ThresholdBarComponent;
  let fixture: ComponentFixture<ThresholdBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThresholdBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThresholdBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
