import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetTriggerConfirmPopoverComponent } from 'src/app/components/set-trigger-confirm-popover/set-trigger-confirm-popover.component';

describe('SetTriggerConfirmPopoverComponent', () => {
  let component: SetTriggerConfirmPopoverComponent;
  let fixture: ComponentFixture<SetTriggerConfirmPopoverComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetTriggerConfirmPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
