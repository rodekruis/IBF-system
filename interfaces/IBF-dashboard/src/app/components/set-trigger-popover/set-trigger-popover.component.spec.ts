import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetTriggerPopoverComponent } from 'src/app/components/set-trigger-popover/set-trigger-popover.component';

describe('SetTriggerPopoverComponent', () => {
  let component: SetTriggerPopoverComponent;
  let fixture: ComponentFixture<SetTriggerPopoverComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetTriggerPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
