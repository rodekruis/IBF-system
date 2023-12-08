import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicPointPopupComponent } from './dynamic-point-popup.component';

describe('DynamicPointPopupComponent', () => {
  let component: DynamicPointPopupComponent;
  let fixture: ComponentFixture<DynamicPointPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicPointPopupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPointPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
