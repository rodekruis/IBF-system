import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularDelegate, PopoverController } from '@ionic/angular';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipComponent],
      providers: [{ provide: PopoverController }, { provide: AngularDelegate }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
