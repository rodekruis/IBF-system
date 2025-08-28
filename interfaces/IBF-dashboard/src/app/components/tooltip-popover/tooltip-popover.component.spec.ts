import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { TooltipPopoverComponent } from 'src/app/components/tooltip-popover/tooltip-popover.component';

describe('TooltipPopoverComponent', () => {
  let component: TooltipPopoverComponent;
  let fixture: ComponentFixture<TooltipPopoverComponent>;

  beforeEach(() => {
    addIcons({ 'information-circle-outline': informationCircleOutline });

    fixture = TestBed.createComponent(TooltipPopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
