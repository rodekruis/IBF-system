import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipPopoverComponent } from 'src/app/components/tooltip-popover/tooltip-popover.component';

describe('TooltipPopoverComponent', () => {
  let component: TooltipPopoverComponent;
  let fixture: ComponentFixture<TooltipPopoverComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
