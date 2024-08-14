import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerApproximateComponent } from './disclaimer-approximate.component';

describe('DisclaimerApproximateComponent', () => {
  let component: DisclaimerApproximateComponent;
  let fixture: ComponentFixture<DisclaimerApproximateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisclaimerApproximateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisclaimerApproximateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
